export const CctCheckStatus = ["UNCHECKED", "PASSED", "BLOCKED"] as const;
export type CctCheckStatus = (typeof CctCheckStatus)[number];
export const CctCheckStatusText: Record<CctCheckStatus, string> = {
  UNCHECKED: "未校验",
  PASSED: "已通过",
  BLOCKED: "被拦截"
};
