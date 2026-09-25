import { create } from "zustand";
import { listCueScene, saveCueScene } from "../api/CueScene";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { MAX_COLOR_TEMP_K, MAX_TOLERANCE_K, MIN_COLOR_TEMP_K } from "../constants/ColorTempRule";
import { buildCalibrationEntries, buildCalibrationEntry, evaluateCuePublish } from "../utils/colorTemperature";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { CuePublishBlocker } from "../types/CuePublishBlocker";

type PublishResult = { ok: boolean; blockers: CuePublishBlocker[]; message: string | null };

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  updateColorTempSettings: (cueId: number, target: number, tolerance: number, fixtures: Fixture[]) => string | null;
  recalculateForFixture: (fixture: Fixture) => void;
  publishCue: (cueId: number, fixtures: Fixture[]) => PublishResult;
};

const PUBLISHED_STATUS = "READY";

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },
  updateColorTempSettings(cueId, target, tolerance, fixtures) {
    const cue = get().rows.find((row) => row.id === cueId);
    if (!cue) return ERROR_MESSAGES.VALIDATION_FAILED;
    if (cue.scene_status === PUBLISHED_STATUS) return ERROR_MESSAGES.CUE_ALREADY_PUBLISHED;
    const valid =
      Number.isFinite(target) && target >= MIN_COLOR_TEMP_K && target <= MAX_COLOR_TEMP_K &&
      Number.isFinite(tolerance) && tolerance >= 0 && tolerance <= MAX_TOLERANCE_K;
    if (!valid) {
      console.warn(ERROR_CODES.COLOR_TEMP_SETTING_INVALID, cueId, target, tolerance);
      return ERROR_MESSAGES.COLOR_TEMP_SETTING_INVALID;
    }
    const next: CueScene = { ...cue, target_color_temp: Math.round(target), tolerance_k: Math.round(tolerance) };
    const saved: CueScene = { ...next, calibration_results: buildCalibrationEntries(next, fixtures) };
    set({ rows: get().rows.map((row) => (row.id === cueId ? saved : row)) });
    console.info(LOG_TEMPLATES.CueScene[4], saved);
    void saveCueScene(saved);
    return null;
  },
  recalculateForFixture(fixture) {
    // 只重算引用该灯具的未发布 Cue；已发布（READY）记录保持快照不动
    const recalculated: CueScene[] = [];
    const rows = get().rows.map((cue) => {
      if (cue.scene_status === PUBLISHED_STATUS || !cue.fixture_ids.includes(fixture.id)) return cue;
      const entry = buildCalibrationEntry(cue, fixture);
      const calibration_results = cue.calibration_results.some((item) => item.fixture_id === fixture.id)
        ? cue.calibration_results.map((item) => (item.fixture_id === fixture.id ? entry : item))
        : [...cue.calibration_results, entry];
      const next = { ...cue, calibration_results };
      recalculated.push(next);
      return next;
    });
    if (recalculated.length === 0) return;
    set({ rows });
    for (const cue of recalculated) {
      console.info(LOG_TEMPLATES.CueScene[5], cue.id, fixture.fixture_code);
      void saveCueScene(cue);
    }
  },
  publishCue(cueId, fixtures) {
    const cue = get().rows.find((row) => row.id === cueId);
    if (!cue) return { ok: false, blockers: [], message: ERROR_MESSAGES.VALIDATION_FAILED };
    if (cue.scene_status === PUBLISHED_STATUS) return { ok: false, blockers: [], message: ERROR_MESSAGES.CUE_ALREADY_PUBLISHED };
    const blockers = evaluateCuePublish(cue, fixtures);
    if (blockers.length > 0) {
      console.warn(ERROR_CODES.CUE_PUBLISH_BLOCKED, cueId, blockers.map((item) => item.fixture_code));
      console.info(LOG_TEMPLATES.CueScene[7], cueId, blockers.map((item) => item.fixture_code));
      return { ok: false, blockers, message: ERROR_MESSAGES.CUE_PUBLISH_BLOCKED };
    }
    const published: CueScene = { ...cue, scene_status: PUBLISHED_STATUS, calibration_results: buildCalibrationEntries(cue, fixtures) };
    set({ rows: get().rows.map((row) => (row.id === cueId ? published : row)) });
    console.info(LOG_TEMPLATES.CueScene[6], published);
    void saveCueScene(published);
    return { ok: true, blockers: [], message: null };
  }
}));
