import { create } from "zustand";
import { listCueScene, publishCueScene } from "../api/CueScene";
import { createCueSceneResponse } from "../constructors/CueSceneConstructor";
import { evaluateCueCct } from "../utils/cctCalibration";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { PUBLISHED_CUE_STATUSES } from "../constants/CueStatus";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";

const STORAGE_KEY = "stage-light.cct.cues.v1";

function persist(rows: CueScene[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 本地存储不可用时保持内存态，页面仍可操作
  }
}

function restore(): CueScene[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as Partial<CueScene>[]).map((row) => createCueSceneResponse(row));
  } catch {
    // 缓存损坏时回退到种子数据
  }
  return null;
}

/** 用当前灯具数据重算单条 Cue 的校验快照 */
function withSnapshot(cue: CueScene, fixtures: Fixture[]): CueScene {
  const evaluation = evaluateCueCct(cue, fixtures);
  return {
    ...cue,
    cct_check_status: evaluation.status,
    cct_check_detail: evaluation.detail,
    cct_checked_at: new Date().toISOString()
  };
}

type State = {
  rows: CueScene[];
  loading: boolean;
  publishError: string;
  publishNotice: string;
  load: () => Promise<void>;
  setCueTarget: (cueId: number, target: number | null, tolerance: number, fixtures: Fixture[]) => Promise<void>;
  publishCue: (cueId: number, fixtures: Fixture[]) => Promise<boolean>;
  recalcForFixture: (fixtureId: number, fixtures: Fixture[]) => void;
  recalcUnpublished: (fixtures: Fixture[]) => void;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  publishError: "",
  publishNotice: "",
  async load() {
    set({ loading: true });
    const cached = restore();
    const rows = cached ?? (await listCueScene());
    if (!cached) persist(rows);
    set({ rows, loading: false });
  },
  async setCueTarget(cueId, target, tolerance, fixtures) {
    const rows = get().rows.map((cue) => {
      if (cue.id !== cueId) return cue;
      const next: CueScene = {
        ...cue,
        target_cct_k: target,
        cct_tolerance_k: Number.isFinite(tolerance) && tolerance > 0 ? Math.round(tolerance) : cue.cct_tolerance_k
      };
      // 已发布记录不动，未发布的随目标变化立即重算
      return (PUBLISHED_CUE_STATUSES as string[]).includes(cue.scene_status) ? next : withSnapshot(next, fixtures);
    });
    set({ rows, publishError: "", publishNotice: "" });
    persist(rows);
    console.info(LOG_TEMPLATES.CueScene.cctCheck, cueId, target, tolerance);
  },
  async publishCue(cueId, fixtures) {
    const cue = get().rows.find((c) => c.id === cueId);
    if (!cue) return false;
    try {
      const published = await publishCueScene(cue, fixtures);
      const rows = get().rows.map((c) => (c.id === cueId ? published : c));
      set({ rows, publishError: "", publishNotice: `${cue.name} 已发布，色温快照已冻结` });
      persist(rows);
      console.info(LOG_TEMPLATES.CueScene.publish, cue.name);
      return true;
    } catch {
      // 发布被挡住：记录拦截快照并点名灯具
      const evaluation = evaluateCueCct(cue, fixtures);
      const blocked: CueScene = {
        ...cue,
        cct_check_status: "BLOCKED",
        cct_check_detail: evaluation.detail,
        cct_checked_at: new Date().toISOString()
      };
      const rows = get().rows.map((c) => (c.id === cueId ? blocked : c));
      const names = evaluation.blockers.map((b) => b.fixtureCode).join("、");
      set({
        rows,
        publishNotice: "",
        publishError: `${ERROR_MESSAGES.CCT_PUBLISH_BLOCKED.replace("{fixtures}", names)}（${evaluation.detail}）`
      });
      persist(rows);
      console.warn(LOG_TEMPLATES.CueScene.publishBlocked, cue.name, evaluation.detail);
      return false;
    }
  },
  recalcForFixture(fixtureId, fixtures) {
    let changed = false;
    const rows = get().rows.map((cue) => {
      if ((PUBLISHED_CUE_STATUSES as string[]).includes(cue.scene_status)) return cue; // 已发布记录不动
      if (!cue.fixture_ids.includes(fixtureId)) return cue; // 只重算引用它的 Cue
      changed = true;
      console.info(LOG_TEMPLATES.CueScene.cctRecalc, cue.name, fixtureId);
      return withSnapshot(cue, fixtures);
    });
    if (changed) {
      set({ rows });
      persist(rows);
    }
  },
  recalcUnpublished(fixtures) {
    const rows = get().rows.map((cue) =>
      (PUBLISHED_CUE_STATUSES as string[]).includes(cue.scene_status) ? cue : withSnapshot(cue, fixtures)
    );
    set({ rows });
    persist(rows);
  }
}));
