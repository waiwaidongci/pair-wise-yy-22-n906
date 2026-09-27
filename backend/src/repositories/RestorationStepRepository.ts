import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({
  ...row,
  step_order: Number(row.step_order),
  finished_at: row.finished_at ?? null
}));

export const restorationStepRepository = {
  findAll: () => rows,
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  insert: (row: RestorationStep) => {
    rows.push(row);
    return row;
  },
  save: (row: unknown) => row
};
