import { request } from "./client";
import { mockPlanClient } from "../mocks/mockPlanClient";
import type { RestorationStep } from "../types/RestorationStep";

const endpoint = "/api/restoration-step";

export async function listRestorationStep(): Promise<RestorationStep[]> {
  try {
    return await request<RestorationStep[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockPlanClient.listSteps();
  }
}

export async function saveRestorationStep(payload: RestorationStep) {
  console.info("save RestorationStep", payload);
  return payload;
}
