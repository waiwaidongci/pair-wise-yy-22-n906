import type { RestorationStep } from "../types/RestorationStep";

/** 批准方案后自动生成的第一条修复步骤。 */
export const createDefaultRestorationStep = (overrides: Partial<RestorationStep> = {}): RestorationStep => ({
  id: 0,
  plan_id: 0,
  step_order: 1,
  technique: "",
  material_used: "待登记",
  operator_id: 0,
  step_status: "PENDING",
  finished_at: null,
  ...overrides
});

export const createRestorationStepForm = createDefaultRestorationStep;
export const createRestorationStepResponse = createDefaultRestorationStep;
