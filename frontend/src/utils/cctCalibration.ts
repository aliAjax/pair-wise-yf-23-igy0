import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import { CCT_CONFIG } from "../constants/cctConfig";
import { WarmupStatus } from "../constants/WarmupStatus";
import type { CctCheckStatus } from "../constants/CctCheckStatus";

/** 单盏灯的预热评估结果 */
export interface FixtureWarmup {
  fixture: Fixture;
  readingCount: number;
  /** 最近两次实测差值（K），读数不足时为 null */
  diffK: number | null;
  status: WarmupStatus;
  /** 稳定结果（K）；预热中或缺实测值时不生成结果，为 null */
  resultCctK: number | null;
}

/** 评估单盏灯：两次实测相差超过 120K 视为仍在预热，不生成结果 */
export function assessFixtureWarmup(fixture: Fixture): FixtureWarmup {
  const readings = (fixture.measured_cct_k ?? []).filter((v) => Number.isFinite(v));
  const recent = readings.slice(-CCT_CONFIG.MAX_READINGS);
  if (recent.length < CCT_CONFIG.MAX_READINGS) {
    return { fixture, readingCount: recent.length, diffK: null, status: "INSUFFICIENT_DATA", resultCctK: null };
  }
  const [previous, latest] = recent;
  const diffK = Math.abs(latest - previous);
  if (diffK > CCT_CONFIG.WARMUP_TOLERANCE_K) {
    return { fixture, readingCount: recent.length, diffK, status: "WARMING", resultCctK: null };
  }
  return { fixture, readingCount: recent.length, diffK, status: "STABLE", resultCctK: Math.round((previous + latest) / 2) };
}

/** 挡住发布的单条原因，点名到具体灯具 */
export interface CueBlocker {
  fixtureId: number;
  fixtureCode: string;
  reason: string;
}

export interface CueCctEvaluation {
  cueId: number;
  /** 生效目标色温（K）：显式目标或关联灯具额定均值 */
  targetCctK: number | null;
  toleranceK: number;
  status: CctCheckStatus;
  blockers: CueBlocker[];
  /** 点名灯具的明细文案 */
  detail: string;
}

/** Cue 的生效目标色温：未显式设置时取关联灯具额定色温均值 */
export function effectiveTargetCctK(cue: CueScene, linkedFixtures: Fixture[]): number | null {
  if (typeof cue.target_cct_k === "number" && Number.isFinite(cue.target_cct_k)) {
    return Math.round(cue.target_cct_k);
  }
  const rated = linkedFixtures.map((f) => f.rated_cct_k).filter((v) => Number.isFinite(v));
  if (!rated.length) return null;
  return Math.round(rated.reduce((sum, v) => sum + v, 0) / rated.length);
}

/** 评估 Cue：关联灯具全部稳定且落在允许偏差内才算通过，否则逐一点名 */
export function evaluateCueCct(cue: CueScene, fixtures: Fixture[]): CueCctEvaluation {
  const linked = cue.fixture_ids
    .map((id) => fixtures.find((f) => f.id === id))
    .filter((f): f is Fixture => Boolean(f));
  const missingIds = cue.fixture_ids.filter((id) => !fixtures.some((f) => f.id === id));
  const targetCctK = effectiveTargetCctK(cue, linked);
  const toleranceK = cue.cct_tolerance_k;
  const blockers: CueBlocker[] = [];

  for (const id of missingIds) {
    blockers.push({ fixtureId: id, fixtureCode: `#${id}`, reason: "关联灯具不存在" });
  }
  if (!linked.length && !missingIds.length) {
    blockers.push({ fixtureId: -1, fixtureCode: "—", reason: "尚未关联任何灯具" });
  }
  if (targetCctK == null) {
    blockers.push({ fixtureId: -1, fixtureCode: "—", reason: "未设置目标色温，且关联灯具缺少额定色温" });
  }
  for (const fixture of linked) {
    const warmup = assessFixtureWarmup(fixture);
    if (warmup.status === "INSUFFICIENT_DATA") {
      blockers.push({ fixtureId: fixture.id, fixtureCode: fixture.fixture_code, reason: `缺实测值（当前 ${warmup.readingCount} 次，需 ${CCT_CONFIG.MAX_READINGS} 次）` });
    } else if (warmup.status === "WARMING") {
      blockers.push({ fixtureId: fixture.id, fixtureCode: fixture.fixture_code, reason: `预热中，两次实测相差 ${warmup.diffK}K，超过 ${CCT_CONFIG.WARMUP_TOLERANCE_K}K` });
    } else if (targetCctK != null && warmup.resultCctK != null) {
      const deviation = Math.abs(warmup.resultCctK - targetCctK);
      if (deviation > toleranceK) {
        blockers.push({ fixtureId: fixture.id, fixtureCode: fixture.fixture_code, reason: `超差，稳定结果 ${warmup.resultCctK}K 偏离目标 ${deviation}K，超过允许 ${toleranceK}K` });
      }
    }
  }

  const status: CctCheckStatus = blockers.length ? "BLOCKED" : "PASSED";
  const detail = blockers.map((b) => `${b.fixtureCode}：${b.reason}`).join("；");
  return { cueId: cue.id, targetCctK, toleranceK, status, blockers, detail };
}
