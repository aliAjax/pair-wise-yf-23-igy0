export const WarmupStatus = ["INSUFFICIENT_DATA", "WARMING", "STABLE"] as const;
export type WarmupStatus = (typeof WarmupStatus)[number];
export const WarmupStatusText: Record<WarmupStatus, string> = {
  INSUFFICIENT_DATA: "缺实测值",
  WARMING: "预热中",
  STABLE: "已稳定"
};
