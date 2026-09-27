import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

export interface RestorationPlanPayload {
  relic_id?: number;
  damage_record_id?: number;
  plan_title?: string;
  method?: string;
  risk_assessment?: string;
  owner_id?: number;
  approval_status?: PlanApprovalStatus;
}

export interface PlanApprovalPayload {
  decision: "APPROVE" | "REJECT";
  reason?: string;
}
