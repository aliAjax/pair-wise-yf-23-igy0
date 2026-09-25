// 色温校正台全局阈值配置：调整任一数值需同步预热判定、发布校验与页面文案。
export const CCT_CONFIG = {
  // 两次实测色温差超过该值视为仍在预热，不生成稳定结果
  WARMUP_TOLERANCE_K: 120,
  // Cue 未显式设置允许偏差时的默认值
  DEFAULT_CUE_TOLERANCE_K: 150,
  // 色温读数合法范围（额定值与实测值共用）
  MIN_CCT_K: 1000,
  MAX_CCT_K: 12000,
  // 每盏灯只保留最近两次实测值
  MAX_READINGS: 2
} as const;
