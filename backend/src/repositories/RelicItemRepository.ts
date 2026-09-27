import { seed } from "../seed";
import type { RelicItem } from "../models/RelicItem";

const rows: RelicItem[] = seed.relicItem.map((row) => ({ ...row }));

export const relicItemRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  updateCondition: (id: number, condition: string) => {
    const row = rows.find((item) => item.id === id);
    if (row) row.current_condition = condition;
    return row;
  },
  save: (row: unknown) => row
};
