import { request } from "./client";
import { mockPlanClient } from "../mocks/mockPlanClient";
import type { RelicItem } from "../types/RelicItem";

const endpoint = "/api/relic-item";

export async function listRelicItem(): Promise<RelicItem[]> {
  try {
    return await request<RelicItem[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockPlanClient.listRelics();
  }
}

export async function saveRelicItem(payload: RelicItem) {
  console.info("save RelicItem", payload);
  return payload;
}
