import type { RestorationPlan } from "../types/RestorationPlan";

export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 0,
  relic_id: 0,
  damage_record_id: 0,
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: "DRAFT",
  owner_id: 0,
  submitted_by: null,
  submitted_at: null,
  approved_by: null,
  approved_at: null,
  rejected_by: null,
  rejected_at: null,
  reject_reason: null,
  ...overrides
});

export const createRestorationPlanForm = createDefaultRestorationPlan;
export const createRestorationPlanResponse = createDefaultRestorationPlan;
