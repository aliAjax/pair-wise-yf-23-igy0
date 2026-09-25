import { create } from "zustand";
import { listFixture, recordFixtureReading, updateFixtureRatedCct } from "../api/Fixture";
import { createFixtureResponse } from "../constructors/FixtureConstructor";
import { useCueSceneStore } from "./CueSceneStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { Fixture } from "../types/Fixture";

const STORAGE_KEY = "stage-light.cct.fixtures.v1";

function persist(rows: Fixture[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 本地存储不可用时保持内存态，页面仍可操作
  }
}

function restore(): Fixture[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as Partial<Fixture>[]).map((row) => createFixtureResponse(row));
  } catch {
    // 缓存损坏时回退到种子数据
  }
  return null;
}

function toMessage(err: unknown): string {
  const code = (err as Error)?.message as keyof typeof ERROR_MESSAGES;
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.VALIDATION_FAILED;
}

type State = {
  rows: Fixture[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  recordReading: (fixtureId: number, value: number) => Promise<boolean>;
  updateRatedCct: (fixtureId: number, value: number) => Promise<boolean>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    const cached = restore();
    const rows = cached ?? (await listFixture());
    if (!cached) persist(rows);
    set({ rows, loading: false });
  },
  async recordReading(fixtureId, value) {
    const fixture = get().rows.find((f) => f.id === fixtureId);
    if (!fixture) return false;
    try {
      const updated = await recordFixtureReading(fixture, value);
      const rows = get().rows.map((f) => (f.id === fixtureId ? updated : f));
      set({ rows, error: "" });
      persist(rows);
      console.info(LOG_TEMPLATES.Fixture.cctReading, updated.fixture_code, value);
      // 新读数可能改变预热状态，重算引用它的未发布 Cue
      useCueSceneStore.getState().recalcForFixture(fixtureId, rows);
      return true;
    } catch (err) {
      set({ error: toMessage(err) });
      return false;
    }
  },
  async updateRatedCct(fixtureId, value) {
    const fixture = get().rows.find((f) => f.id === fixtureId);
    if (!fixture) return false;
    try {
      const updated = await updateFixtureRatedCct(fixture, value);
      const rows = get().rows.map((f) => (f.id === fixtureId ? updated : f));
      set({ rows, error: "" });
      persist(rows);
      console.info(LOG_TEMPLATES.Fixture.ratedCctChange, updated.fixture_code, value);
      // 调额定值只重算引用它的未发布 Cue，已发布记录不动
      useCueSceneStore.getState().recalcForFixture(fixtureId, rows);
      return true;
    } catch (err) {
      set({ error: toMessage(err) });
      return false;
    }
  }
}));
