/** 统一请求封装：前端只请求 /api，由 Nginx 反代到后端，禁止硬编码 localhost。 */
export interface ApiActor {
  userId: number;
  role: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function request<T>(path: string, init: RequestInit = {}, actor?: ApiActor): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as Record<string, string> | undefined) };
  if (actor) {
    headers["x-user-id"] = String(actor.userId);
    headers["x-role"] = actor.role;
  }
  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.code ?? "HTTP_ERROR", data?.message ?? `请求失败（${res.status}）`);
  }
  return data as T;
}
