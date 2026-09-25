import { mockData } from "../mocks/seedData";
import type { Fixture } from "../types/Fixture";
import { createFixtureResponse } from "../constructors/FixtureConstructor";
import { CCT_CONFIG } from "../constants/cctConfig";
import { ERROR_CODES } from "../constants/errorCodes";

const endpoint = "/api/fixture";

export async function listFixture(): Promise<Fixture[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return mockData.fixture.map((row) => createFixtureResponse(row as unknown as Partial<Fixture>));
}

export async function saveFixture(payload: Fixture) {
  console.info("save Fixture", payload);
  return payload;
}

function assertValidCct(value: number, code: string) {
  if (!Number.isFinite(value) || value < CCT_CONFIG.MIN_CCT_K || value > CCT_CONFIG.MAX_CCT_K) {
    throw new Error(code);
  }
}

/** 录入一次实测读数：只保留最近两次，service 层先做范围校验 */
export async function recordFixtureReading(fixture: Fixture, value: number): Promise<Fixture> {
  assertValidCct(value, ERROR_CODES.CCT_READING_INVALID);
  const measured_cct_k = [...fixture.measured_cct_k, Math.round(value)].slice(-CCT_CONFIG.MAX_READINGS);
  return { ...fixture, measured_cct_k };
}

/** 调整额定色温：调用方负责触发未发布 Cue 的重算 */
export async function updateFixtureRatedCct(fixture: Fixture, value: number): Promise<Fixture> {
  assertValidCct(value, ERROR_CODES.CCT_RATED_INVALID);
  return { ...fixture, rated_cct_k: Math.round(value) };
}
