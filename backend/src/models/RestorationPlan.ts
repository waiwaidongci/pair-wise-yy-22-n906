export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  submitted_by: number | null;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  reject_reason: string | null;
}
