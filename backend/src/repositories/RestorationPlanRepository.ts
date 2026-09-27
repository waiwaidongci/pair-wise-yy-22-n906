import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const restorationPlanRepository = {
  findAll: (): RestorationPlan[] => rows,
  findById: (id: number): RestorationPlan | undefined => rows.find((row) => row.id === id),
  create(row: Omit<RestorationPlan, "id">): RestorationPlan {
    const created: RestorationPlan = { ...row, id: nextId++ };
    rows.push(created);
    return created;
  },
  update(id: number, patch: Partial<RestorationPlan>): RestorationPlan | undefined {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  },
  save(row: unknown): unknown {
    const plan = row as Partial<RestorationPlan>;
    if (plan && typeof plan.id === "number" && rows.some((item) => item.id === plan.id)) {
      return restorationPlanRepository.update(plan.id, plan);
    }
    const { id: _ignored, ...rest } = plan ?? {};
    return restorationPlanRepository.create(rest as Omit<RestorationPlan, "id">);
  }
};
