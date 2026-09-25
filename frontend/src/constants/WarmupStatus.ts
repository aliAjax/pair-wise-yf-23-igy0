import type { CuePublishBlockReason } from "../types/CuePublishBlocker";

export const WarmupStatus = ["INSUFFICIENT_DATA","WARMING_UP","STABLE"] as const;
export type WarmupStatus = (typeof WarmupStatus)[number];
export const WarmupStatusText: Record<WarmupStatus, string> = {
  INSUFFICIENT_DATA: "缺实测值",
  WARMING_UP: "预热中",
  STABLE: "稳定"
};
export const CuePublishBlockReasonText: Record<CuePublishBlockReason, string> = {
  INSUFFICIENT_DATA: "缺实测值",
  WARMING_UP: "预热中",
  OUT_OF_TOLERANCE: "超差"
};
