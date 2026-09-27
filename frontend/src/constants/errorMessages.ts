export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在或已被删除",
  PLAN_NOT_PENDING: "方案不在待审批状态，可能已被处理，请勿重复审批",
  PLAN_NOT_SUBMITTABLE: "只有草稿或已退回的方案可以提交审批",
  REJECT_REASON_REQUIRED: "退回方案时必须填写退回原因",
  RELIC_NOT_FOUND: "方案关联的文物不存在",
  NETWORK_ERROR: "无法连接后端服务，请确认服务已启动后重试"
};
