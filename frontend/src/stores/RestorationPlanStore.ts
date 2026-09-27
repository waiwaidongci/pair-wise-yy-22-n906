import { create } from "zustand";
import {
  listRestorationPlan,
  createRestorationPlanDraft,
  submitRestorationPlan,
  reviewRestorationPlan,
  type PlanDraftPayload,
  type PlanApprovalRequest
} from "../api/RestorationPlan";
import { mockData } from "../mocks/seedData";
import type { RestorationPlan, PlanReviewResult } from "../types/RestorationPlan";
import type { ApiActor } from "../api/client";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  lastUpdatedAt: string | null;
  load: () => Promise<void>;
  createDraft: (payload: PlanDraftPayload, actor: ApiActor) => Promise<RestorationPlan>;
  submit: (id: number, actor: ApiActor) => Promise<RestorationPlan>;
  review: (id: number, payload: PlanApprovalRequest, actor: ApiActor) => Promise<PlanReviewResult>;
  upsert: (plan: RestorationPlan) => void;
};

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [...(mockData.restorationPlan as unknown as RestorationPlan[])],
  loading: false,
  lastUpdatedAt: null,

  async load() {
    set({ loading: true });
    try {
      set({ rows: await listRestorationPlan() });
    } finally {
      set({ loading: false });
    }
  },

  upsert(plan) {
    const rows = get().rows;
    const exists = rows.some((row) => row.id === plan.id);
    set({
      rows: exists ? rows.map((row) => (row.id === plan.id ? plan : row)) : [plan, ...rows],
      lastUpdatedAt: new Date().toISOString()
    });
  },

  async createDraft(payload, actor) {
    const plan = await createRestorationPlanDraft(payload, actor);
    get().upsert(plan);
    return plan;
  },

  async submit(id, actor) {
    const plan = await submitRestorationPlan(id, actor);
    get().upsert(plan);
    return plan;
  },

  async review(id, payload, actor) {
    const result = await reviewRestorationPlan(id, payload, actor);
    get().upsert(result.plan);
    return result;
  }
}));
