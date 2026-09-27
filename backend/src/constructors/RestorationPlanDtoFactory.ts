import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

export const createRestorationPlanDto = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "plan title 1",
  method: "method 1",
  risk_assessment: "risk assessment 1",
  approval_status: PlanApprovalStatus[1],
  owner_id: 1,
  submitted_by: null,
  submitted_at: null,
  reviewed_by: null,
  reviewed_at: null,
  reject_reason: null,
  ...overrides
});
