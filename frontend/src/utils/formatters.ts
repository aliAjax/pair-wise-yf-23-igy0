export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
/** 色温展示：3200 -> "3,200 K"，空值显示占位符 */
export const formatCct = (value: number | null | undefined) => (value == null || !Number.isFinite(value) ? "—" : `${formatNumber(value)} K`);
/** 两次实测差值展示，空值显示占位符 */
export const formatCctDiff = (value: number | null | undefined) => (value == null || !Number.isFinite(value) ? "—" : `${formatNumber(value)} K`);
