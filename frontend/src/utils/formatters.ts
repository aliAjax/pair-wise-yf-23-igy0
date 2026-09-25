export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatColorTemp = (value: number) => `${Math.round(value)}K`;
export const formatSignedKelvin = (value: number) => `${value > 0 ? "+" : ""}${Math.round(value)}K`;
