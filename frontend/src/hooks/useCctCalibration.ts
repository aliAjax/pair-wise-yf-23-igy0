import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import { assessFixtureWarmup, evaluateCueCct } from "../utils/cctCalibration";
import type { CueCctEvaluation, FixtureWarmup } from "../utils/cctCalibration";

/** 色温校正台派生数据：灯具预热状态、每条 Cue 的实时校验结果与汇总统计 */
export function useCctCalibration(fixtures: Fixture[], cues: CueScene[]) {
  const warmupRows: FixtureWarmup[] = useMemo(() => fixtures.map(assessFixtureWarmup), [fixtures]);

  const evaluations: Map<number, CueCctEvaluation> = useMemo(() => {
    const map = new Map<number, CueCctEvaluation>();
    for (const cue of cues) map.set(cue.id, evaluateCueCct(cue, fixtures));
    return map;
  }, [cues, fixtures]);

  const summary = useMemo(
    () => ({
      warming: warmupRows.filter((w) => w.status === "WARMING").length,
      stable: warmupRows.filter((w) => w.status === "STABLE").length,
      insufficient: warmupRows.filter((w) => w.status === "INSUFFICIENT_DATA").length
    }),
    [warmupRows]
  );

  return { warmupRows, evaluations, summary };
}
