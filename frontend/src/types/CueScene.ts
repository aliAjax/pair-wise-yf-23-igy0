import type { CueCalibrationEntry } from "./CueCalibration";

export interface CueScene {
  id: number;
  name: string;
  fixture_states: string;
  fade_in_ms: string;
  hold_ms: string;
  priority: string;
  scene_status: string;
  target_color_temp: number;
  tolerance_k: number;
  fixture_ids: number[];
  calibration_results: CueCalibrationEntry[];
}
