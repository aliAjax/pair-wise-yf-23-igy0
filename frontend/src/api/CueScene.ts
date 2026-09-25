import { mockData } from "../mocks/seedData";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import { createCueSceneResponse } from "../constructors/CueSceneConstructor";
import { evaluateCueCct } from "../utils/cctCalibration";
import { ERROR_CODES } from "../constants/errorCodes";

const endpoint = "/api/cue-scene";

export async function listCueScene(): Promise<CueScene[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return mockData.cueScene.map((row) => createCueSceneResponse(row as unknown as Partial<CueScene>));
}

export async function saveCueScene(payload: CueScene) {
  console.info("save CueScene", payload);
  return payload;
}

/** 发布 Cue：service 层校验色温，未通过则抛出 CCT_PUBLISH_BLOCKED 由调用方包装 */
export async function publishCueScene(cue: CueScene, fixtures: Fixture[]): Promise<CueScene> {
  const evaluation = evaluateCueCct(cue, fixtures);
  if (evaluation.status === "BLOCKED") {
    throw new Error(ERROR_CODES.CCT_PUBLISH_BLOCKED);
  }
  return {
    ...cue,
    scene_status: "READY",
    cct_check_status: "PASSED",
    cct_check_detail: "",
    cct_checked_at: new Date().toISOString()
  };
}
