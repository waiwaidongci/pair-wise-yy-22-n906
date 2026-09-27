export const createRestorationStepDto = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  plan_id: 1,
  step_order: 1,
  technique: "按审批方案执行首道修复工序",
  material_used: "待登记",
  operator_id: 1,
  step_status: "PENDING",
  finished_at: null,
  ...overrides
});
