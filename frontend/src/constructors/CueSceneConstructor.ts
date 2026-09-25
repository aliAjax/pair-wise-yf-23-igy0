import { DEFAULT_TARGET_COLOR_TEMP_K, DEFAULT_TOLERANCE_K } from "../constants/ColorTempRule";
import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 1 as never,
  name: "name 1" as never,
  fixture_states: "fixture states 1" as never,
  fade_in_ms: "fade in ms 1" as never,
  hold_ms: "hold ms 1" as never,
  priority: "priority 1" as never,
  scene_status: "READY" as never,
  target_color_temp: DEFAULT_TARGET_COLOR_TEMP_K,
  tolerance_k: DEFAULT_TOLERANCE_K,
  fixture_ids: [],
  calibration_results: [],
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
