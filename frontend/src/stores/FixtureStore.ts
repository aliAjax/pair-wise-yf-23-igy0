import { create } from "zustand";
import { listFixture, saveFixture } from "../api/Fixture";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { MAX_COLOR_TEMP_K, MIN_COLOR_TEMP_K } from "../constants/ColorTempRule";
import { useCueSceneStore } from "./CueSceneStore";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  recordMeasurement: (fixtureId: number, kelvin: number) => string | null;
  updateRatedTemp: (fixtureId: number, kelvin: number) => string | null;
};

const isValidKelvin = (kelvin: number) => Number.isFinite(kelvin) && kelvin >= MIN_COLOR_TEMP_K && kelvin <= MAX_COLOR_TEMP_K;

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  recordMeasurement(fixtureId, kelvin) {
    if (!isValidKelvin(kelvin)) {
      console.warn(ERROR_CODES.MEASUREMENT_OUT_OF_RANGE, fixtureId, kelvin);
      return ERROR_MESSAGES.MEASUREMENT_OUT_OF_RANGE;
    }
    const rows = get().rows.map((row) =>
      row.id === fixtureId ? { ...row, measured_temps: [Math.round(kelvin), ...row.measured_temps].slice(0, 2) } : row
    );
    set({ rows });
    const updated = rows.find((row) => row.id === fixtureId);
    console.info(LOG_TEMPLATES.Fixture[4], updated);
    if (updated) void saveFixture(updated);
    return null;
  },
  updateRatedTemp(fixtureId, kelvin) {
    if (!isValidKelvin(kelvin)) {
      console.warn(ERROR_CODES.RATED_TEMP_OUT_OF_RANGE, fixtureId, kelvin);
      return ERROR_MESSAGES.RATED_TEMP_OUT_OF_RANGE;
    }
    const rows = get().rows.map((row) => (row.id === fixtureId ? { ...row, rated_color_temp: Math.round(kelvin) } : row));
    set({ rows });
    const updated = rows.find((row) => row.id === fixtureId);
    console.info(LOG_TEMPLATES.Fixture[5], updated);
    if (updated) {
      void saveFixture(updated);
      // 额定值变更只重算引用它的未发布 Cue，已发布记录不动
      useCueSceneStore.getState().recalculateForFixture(updated);
    }
    return null;
  }
}));
