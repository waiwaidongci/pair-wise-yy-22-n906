export const PlanApprovalStatus = ["DRAFT","SUBMITTED","APPROVED","REJECTED","ARCHIVED"] as const;
export type PlanApprovalStatus = (typeof PlanApprovalStatus)[number];
export const PlanApprovalStatusText: Record<PlanApprovalStatus, string> = Object.fromEntries(PlanApprovalStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<PlanApprovalStatus, string>;
export const PlanApprovalStatusZh: Record<PlanApprovalStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "待审批",
  APPROVED: "已通过",
  REJECTED: "已退回",
  ARCHIVED: "已归档"
};
