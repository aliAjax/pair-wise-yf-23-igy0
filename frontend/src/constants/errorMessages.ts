export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  MEASUREMENT_OUT_OF_RANGE: "实测色温超出合理范围（1500K-12000K）",
  RATED_TEMP_OUT_OF_RANGE: "额定色温超出合理范围（1500K-12000K）",
  COLOR_TEMP_SETTING_INVALID: "目标色温或允许偏差缺失、超出合理范围",
  CUE_ALREADY_PUBLISHED: "该 Cue 已发布，校正快照保持不动",
  CUE_PUBLISH_BLOCKED: "存在未稳定或超差的灯具，发布已被拦截"
};
