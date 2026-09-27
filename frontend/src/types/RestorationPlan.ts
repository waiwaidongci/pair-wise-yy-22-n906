import type { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: PlanApprovalStatus | string;
  owner_id: number;
  /** 提交人（修复师） */
  submitted_by: number | null;
  submitted_at: string | null;
  /** 审批人（专家） */
  reviewed_by: number | null;
  reviewed_at: string | null;
  /** 退回原因，仅 REJECTED 时存在 */
  reject_reason: string | null;
}

export interface PlanReviewResult {
  plan: RestorationPlan;
  step: import("../types/RestorationStep").RestorationStep | null;
  relic: import("../types/RelicItem").RelicItem | null;
}
