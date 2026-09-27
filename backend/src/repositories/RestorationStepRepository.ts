import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const restorationStepRepository = {
  findAll: (): RestorationStep[] => rows,
  findById: (id: number): RestorationStep | undefined => rows.find((row) => row.id === id),
  findByPlan: (planId: number): RestorationStep[] => rows.filter((row) => row.plan_id === planId),
  create(row: Omit<RestorationStep, "id">): RestorationStep {
    const created: RestorationStep = { ...row, id: nextId++ };
    rows.push(created);
    return created;
  },
  update(id: number, patch: Partial<RestorationStep>): RestorationStep | undefined {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  },
  save(row: unknown): unknown {
    const step = row as Partial<RestorationStep>;
    if (step && typeof step.id === "number" && rows.some((item) => item.id === step.id)) {
      return restorationStepRepository.update(step.id, step);
    }
    const { id: _ignored, ...rest } = step ?? {};
    return restorationStepRepository.create(rest as Omit<RestorationStep, "id">);
  }
};
