import type { CueScene } from "../types/CueScene";
import { CCT_CONFIG } from "../constants/cctConfig";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 1 as never,
  name: "name 1" as never,
  fixture_states: "fixture states 1" as never,
  fade_in_ms: "fade in ms 1" as never,
  hold_ms: "hold ms 1" as never,
  priority: "priority 1" as never,
  scene_status: "READY" as never,
  target_cct_k: null,
  cct_tolerance_k: CCT_CONFIG.DEFAULT_CUE_TOLERANCE_K,
  fixture_ids: [],
  cct_check_status: "UNCHECKED",
  cct_check_detail: "",
  cct_checked_at: "",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
