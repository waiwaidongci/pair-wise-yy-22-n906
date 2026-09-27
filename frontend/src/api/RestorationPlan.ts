import { request, ApiError, type ApiActor } from "./client";
import { mockPlanClient, MockApiError, type MockOperator } from "../mocks/mockPlanClient";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { RestorationPlan, PlanReviewResult } from "../types/RestorationPlan";

const endpoint = "/api/restoration-plan";

export interface PlanDraftPayload {
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
}

export interface PlanApprovalRequest {
  decision: "APPROVE" | "REJECT";
  reason?: string;
}

const toMockOperator = (actor: ApiActor): MockOperator => ({ id: actor.userId, role: actor.role });

const isOffline = (err: unknown) =>
  typeof window !== "undefined" &&
  (err instanceof TypeError || (err as ApiError)?.status >= 502 || (err as ApiError)?.status === 0);

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  try {
    return await request<RestorationPlan[]>(endpoint);
  } catch (err) {
    if (isOffline(err)) return mockPlanClient.listPlans();
    throw err;
  }
}

export async function createRestorationPlanDraft(payload: PlanDraftPayload, actor: ApiActor): Promise<RestorationPlan> {
  try {
    return await request<RestorationPlan>(endpoint, { method: "POST", body: JSON.stringify(payload) }, actor);
  } catch (err) {
    if (isOffline(err)) return mockPlanClient.createDraft(payload, toMockOperator(actor));
    throw err;
  }
}

export async function submitRestorationPlan(id: number, actor: ApiActor): Promise<RestorationPlan> {
  try {
    return await request<RestorationPlan>(`${endpoint}/${id}/submit`, { method: "POST" }, actor);
  } catch (err) {
    if (isOffline(err)) return mockPlanClient.submit(id, toMockOperator(actor));
    throw err;
  }
}

export async function reviewRestorationPlan(id: number, payload: PlanApprovalRequest, actor: ApiActor): Promise<PlanReviewResult> {
  try {
    return await request<PlanReviewResult>(`${endpoint}/${id}/approval`, { method: "POST", body: JSON.stringify(payload) }, actor);
  } catch (err) {
    if (isOffline(err)) return mockPlanClient.review(id, payload, toMockOperator(actor));
    throw err;
  }
}

/** 统一错误文案：后端业务错误优先，其余映射到本地错误消息。 */
export function describeApprovalError(err: unknown): string {
  if (err instanceof ApiError || err instanceof MockApiError) {
    return err.message || ERROR_MESSAGES[err.code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.VALIDATION_FAILED;
  }
  return ERROR_MESSAGES.VALIDATION_FAILED;
}

/** 兼容旧调用名。 */
export const saveRestorationPlan = (payload: Partial<RestorationPlan>) => {
  console.info("save RestorationPlan", payload);
  return Promise.resolve(payload);
};
