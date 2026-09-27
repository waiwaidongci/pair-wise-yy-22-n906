export interface RestorationStepPayload {
  plan_id?: number;
  step_order?: number;
  technique?: string;
  material_used?: string;
  operator_id?: number;
  step_status?: string;
}
