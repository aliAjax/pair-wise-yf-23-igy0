import { WARMUP_DRIFT_THRESHOLD_K } from "../constants/ColorTempRule";
import type { WarmupStatus } from "../types/WarmupStatus";
import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { CueCalibrationEntry } from "../types/CueCalibration";
import type { CuePublishBlocker } from "../types/CuePublishBlocker";

export function getWarmupStatus(fixture: Fixture): WarmupStatus {
  if (fixture.measured_temps.length < 2) return "INSUFFICIENT_DATA";
  const [latest, previous] = fixture.measured_temps;
  return Math.abs(latest - previous) > WARMUP_DRIFT_THRESHOLD_K ? "WARMING_UP" : "STABLE";
}

export function getStableColorTemp(fixture: Fixture): number | null {
  if (getWarmupStatus(fixture) !== "STABLE") return null;
  const [latest, previous] = fixture.measured_temps;
  return (latest + previous) / 2;
}

export function buildCalibrationEntry(cue: CueScene, fixture: Fixture): CueCalibrationEntry {
  return {
    fixture_id: fixture.id,
    rated_color_temp: fixture.rated_color_temp,
    correction_k: cue.target_color_temp - fixture.rated_color_temp
  };
}

export function buildCalibrationEntries(cue: CueScene, fixtures: Fixture[]): CueCalibrationEntry[] {
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return cue.fixture_ids
    .map((id) => byId.get(id))
    .filter((fixture): fixture is Fixture => Boolean(fixture))
    .map((fixture) => buildCalibrationEntry(cue, fixture));
}

export function evaluateCuePublish(cue: CueScene, fixtures: Fixture[]): CuePublishBlocker[] {
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  const blockers: CuePublishBlocker[] = [];
  for (const fixtureId of cue.fixture_ids) {
    const fixture = byId.get(fixtureId);
    if (!fixture) {
      blockers.push({ fixture_id: fixtureId, fixture_code: `#${fixtureId}`, reason: "INSUFFICIENT_DATA", stable_color_temp: null, deviation_k: null });
      continue;
    }
    const status = getWarmupStatus(fixture);
    if (status !== "STABLE") {
      blockers.push({ fixture_id: fixture.id, fixture_code: fixture.fixture_code, reason: status, stable_color_temp: null, deviation_k: null });
      continue;
    }
    const stable = getStableColorTemp(fixture);
    const deviation = stable === null ? Number.POSITIVE_INFINITY : Math.abs(stable - cue.target_color_temp);
    if (deviation > cue.tolerance_k) {
      blockers.push({ fixture_id: fixture.id, fixture_code: fixture.fixture_code, reason: "OUT_OF_TOLERANCE", stable_color_temp: stable, deviation_k: deviation });
    }
  }
  return blockers;
}
