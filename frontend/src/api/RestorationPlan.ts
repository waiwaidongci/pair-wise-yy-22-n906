import { mockData } from "../mocks/seedData";
import type { RestorationPlan, PlanApprovalResult } from "../types/RestorationPlan";
import type { Role } from "../constants/roles";
import { ROLE_USER_ID } from "../constants/roles";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const endpoint = "/api/restoration-plan";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationPlan as unknown as RestorationPlan[])];
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

async function parseError(res: Response): Promise<never> {
  let code = "INTERNAL_ERROR";
  let serverMessage = "";
  try {
    const body = await res.json();
    code = typeof body?.code === "string" ? body.code : code;
    serverMessage = typeof body?.message === "string" ? body.message : "";
  } catch {
    // Error responses without JSON body fall back to code-based copy.
  }
  const localized = ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES];
  throw new ApiError(code, localized ?? serverMessage ?? code);
}

async function postJson<T>(url: string, role: Role, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-role": role,
        "x-user-id": String(ROLE_USER_ID[role])
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(ERROR_CODES.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR);
  }
  if (!res.ok) return parseError(res);
  return (await res.json()) as T;
}

export const createRestorationPlan = (payload: Partial<RestorationPlan>, role: Role) =>
  postJson<RestorationPlan>(endpoint, role, payload);

export const submitRestorationPlan = (id: number, role: Role) =>
  postJson<RestorationPlan>(`${endpoint}/${id}/submit`, role);

export const approveRestorationPlan = (id: number, role: Role) =>
  postJson<PlanApprovalResult>(`${endpoint}/${id}/approve`, role);

export const rejectRestorationPlan = (id: number, reason: string, role: Role) =>
  postJson<PlanApprovalResult>(`${endpoint}/${id}/reject`, role, { reason });
