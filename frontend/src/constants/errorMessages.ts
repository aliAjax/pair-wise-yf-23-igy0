export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  CCT_READING_INVALID: "实测色温读数无效，请输入 1000–12000K 之间的数值",
  CCT_RATED_INVALID: "额定色温无效，请输入 1000–12000K 之间的数值",
  CCT_PUBLISH_BLOCKED: "色温校验未通过，以下灯具挡住发布：{fixtures}"
};
