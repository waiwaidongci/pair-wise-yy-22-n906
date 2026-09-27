import { create } from "zustand";
import { listRestorationStep } from "../api/RestorationStep";
import { mockData } from "../mocks/seedData";
import type { RestorationStep } from "../types/RestorationStep";

type State = { rows: RestorationStep[]; loading: boolean; load: () => Promise<void> };

export const useRestorationStepStore = create<State>((set) => ({
  rows: [...(mockData.restorationStep as unknown as RestorationStep[])],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationStep(), loading: false });
  }
}));
