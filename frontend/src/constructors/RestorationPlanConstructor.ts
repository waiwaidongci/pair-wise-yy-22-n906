import type { RestorationPlan } from "../types/RestorationPlan";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

/** 后端返回的完整方案结构（含审批留痕字段）。 */
export const createDefaultRestorationPlan = (overrides: Partial<RestorationPlan> = {}): RestorationPlan => ({
  id: 0,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "",
  method: "",
  risk_assessment: "",
  approval_status: PlanApprovalStatus[0],
  owner_id: 0,
  submitted_by: null,
  submitted_at: null,
  reviewed_by: null,
  reviewed_at: null,
  reject_reason: null,
  ...overrides
});

/** 修复师编制方案时的表单结构（只填业务字段）。 */
export const createRestorationPlanForm = (
  overrides: Partial<Pick<RestorationPlan, "relic_id" | "damage_record_id" | "plan_title" | "method" | "risk_assessment" | "owner_id">> = {}
) => ({
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "",
  method: "",
  risk_assessment: "",
  owner_id: 0,
  ...overrides
});

export const createRestorationPlanResponse = createDefaultRestorationPlan;
