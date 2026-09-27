import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({
  id: row.id,
  relic_id: row.relic_id,
  damage_record_id: row.damage_record_id,
  plan_title: row.plan_title,
  method: row.method,
  risk_assessment: row.risk_assessment,
  approval_status: row.approval_status,
  owner_id: row.owner_id,
  submitted_by: row.submitted_by,
  submitted_at: row.submitted_at,
  reviewed_by: row.reviewed_by,
  reviewed_at: row.reviewed_at,
  reject_reason: row.reject_reason
}));

export const restorationPlanRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  insert: (row: RestorationPlan) => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RestorationPlan>) => {
    const row = rows.find((item) => item.id === id);
    if (row) Object.assign(row, patch);
    return row;
  },
  /** 修复师提交：只有草稿/退回态可以重新送审。 */
  markSubmitted: (id: number, userId: number, submittedAt: string) => {
    const row = rows.find((item) => item.id === id);
    if (row) {
      row.approval_status = PlanApprovalStatus[1]; // SUBMITTED
      row.submitted_by = userId;
      row.submitted_at = submittedAt;
      row.reviewed_by = null;
      row.reviewed_at = null;
      row.reject_reason = null;
    }
    return row;
  },
  save: (row: unknown) => row
};
