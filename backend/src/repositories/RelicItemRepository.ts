import { seed } from "../seed";
import type { RelicItem } from "../models/RelicItem";

const rows: RelicItem[] = seed.relicItem.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const relicItemRepository = {
  findAll: (): RelicItem[] => rows,
  findById: (id: number): RelicItem | undefined => rows.find((row) => row.id === id),
  create(row: Omit<RelicItem, "id">): RelicItem {
    const created: RelicItem = { ...row, id: nextId++ };
    rows.push(created);
    return created;
  },
  update(id: number, patch: Partial<RelicItem>): RelicItem | undefined {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return undefined;
    rows[index] = { ...rows[index], ...patch, id };
    return rows[index];
  },
  save(row: unknown): unknown {
    const relic = row as Partial<RelicItem>;
    if (relic && typeof relic.id === "number" && rows.some((item) => item.id === relic.id)) {
      return relicItemRepository.update(relic.id, relic);
    }
    const { id: _ignored, ...rest } = relic ?? {};
    return relicItemRepository.create(rest as Omit<RelicItem, "id">);
  }
};
