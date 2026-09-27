export const PlanApprovalStatus = ["DRAFT","SUBMITTED","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
export const PlanApprovalStatusText: Record<PlanApprovalStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "待审批",
  APPROVED: "已批准",
  REJECTED: "已退回",
  ARCHIVED: "已归档"
};
