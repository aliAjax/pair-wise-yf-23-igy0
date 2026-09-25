export const CueStatus = ["DRAFT","READY","DISABLED","ARCHIVED"] as const;
export type CueStatus = (typeof CueStatus)[number];
export const CueStatusText: Record<CueStatus, string> = Object.fromEntries(CueStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<CueStatus, string>;
// 已发布（冻结）的 Cue 状态：调整灯具额定色温时这些记录不参与重算
export const PUBLISHED_CUE_STATUSES: CueStatus[] = ["READY", "ARCHIVED"];
