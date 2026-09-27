export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: number;
  technique: string;
  material_used: string;
  operator_id: number;
  step_status: string;
  finished_at: string | null;
}
