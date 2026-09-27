import { create } from "zustand";
import { listRelicItem } from "../api/RelicItem";
import { mockData } from "../mocks/seedData";
import type { RelicItem } from "../types/RelicItem";

type State = { rows: RelicItem[]; loading: boolean; load: () => Promise<void> };

export const useRelicItemStore = create<State>((set) => ({
  rows: [...(mockData.relicItem as unknown as RelicItem[])],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRelicItem(), loading: false });
  }
}));
