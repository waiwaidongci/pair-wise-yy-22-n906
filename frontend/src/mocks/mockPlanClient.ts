import { mockData } from "./seedData";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { RelicCondition } from "../constants/RelicCondition";
import { createRestorationPlanForm } from "../constructors/RestorationPlanConstructor";
import { createDefaultRestorationStep } from "../constructors/RestorationStepConstructor";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { RelicItem } from "../types/RelicItem";
import type { PlanReviewResult } from "../types/RestorationPlan";
import type { PlanDraftPayload, PlanApprovalRequest } from "../api/RestorationPlan";

/**
 * 后端不可达时的本地模拟层：与后端 /api/restoration-plan 路由保持一致的
 * 角色校验、状态机与联动手感，保证离线评审时页面依然可演示。
 */
export class MockApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const plans = clone(mockData.restorationPlan) as unknown as RestorationPlan[];
const steps = clone(mockData.restorationStep) as unknown as RestorationStep[];
const relics = clone(mockData.relicItem) as unknown as RelicItem[];

export interface MockOperator {
  id: number;
  role: string;
}

export const mockPlanClient = {
  listPlans: () => clone(plans),

  listSteps: () => clone(steps),

  listRelics: () => clone(relics),

  createDraft(payload: PlanDraftPayload, operator: MockOperator) {
    if (operator.role !== "RESTORER") {
      throw new MockApiError(403, "RBAC_DENIED", `当前角色没有执行该动作的权限：需要 RESTORER，当前 ${operator.role}`);
    }
    const form = createRestorationPlanForm({
      relic_id: payload.relic_id,
      damage_record_id: payload.damage_record_id,
      plan_title: payload.plan_title,
      method: payload.method,
      risk_assessment: payload.risk_assessment,
      owner_id: operator.id
    });
    const row: RestorationPlan = {
      ...form,
      id: plans.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      approval_status: PlanApprovalStatus[0],
      submitted_by: null,
      submitted_at: null,
      reviewed_by: null,
      reviewed_at: null,
      reject_reason: null
    };
    plans.push(row);
    return clone(row);
  },

  submit(id: number, operator: MockOperator) {
    const plan = plans.find((item) => item.id === id);
    if (!plan) throw new MockApiError(404, "PLAN_NOT_FOUND", "方案不存在或已被删除");
    if (plan.owner_id !== operator.id) {
      throw new MockApiError(403, "RBAC_DENIED", "只有方案的编制人（修复师）可以提交该方案");
    }
    if (plan.approval_status !== PlanApprovalStatus[0] && plan.approval_status !== PlanApprovalStatus[3]) {
      throw new MockApiError(409, "PLAN_NOT_SUBMITTED", `仅草稿或已退回的方案可以提交，当前状态：${plan.approval_status}`);
    }
    plan.approval_status = PlanApprovalStatus[1];
    plan.submitted_by = operator.id;
    plan.submitted_at = new Date().toISOString();
    plan.reviewed_by = null;
    plan.reviewed_at = null;
    plan.reject_reason = null;
    return clone(plan);
  },

  review(id: number, payload: PlanApprovalRequest, operator: MockOperator): PlanReviewResult {
    if (operator.role !== "EXPERT") {
      throw new MockApiError(403, "RBAC_DENIED", `只有专家（EXPERT）可以审批修复方案，当前角色：${operator.role}`);
    }
    const plan = plans.find((item) => item.id === id);
    if (!plan) throw new MockApiError(404, "PLAN_NOT_FOUND", "方案不存在或已被删除");
    if (plan.approval_status !== PlanApprovalStatus[1]) {
      throw new MockApiError(409, "PLAN_NOT_SUBMITTED", `只有待审批（SUBMITTED）方案才能处理，当前状态：${plan.approval_status}`);
    }
    const reviewedAt = new Date().toISOString();

    if (payload.decision === "REJECT") {
      const reason = (payload.reason ?? "").trim();
      if (!reason) throw new MockApiError(400, "REJECT_REASON_REQUIRED", "退回方案必须填写退回原因");
      plan.approval_status = PlanApprovalStatus[3];
      plan.reviewed_by = operator.id;
      plan.reviewed_at = reviewedAt;
      plan.reject_reason = reason;
      const relic = relics.find((item) => item.id === plan.relic_id) ?? null;
      return { plan: clone(plan), step: null, relic: clone(relic) };
    }

    plan.approval_status = PlanApprovalStatus[2];
    plan.reviewed_by = operator.id;
    plan.reviewed_at = reviewedAt;
    plan.reject_reason = null;

    let step = steps.find((item) => item.plan_id === id);
    if (!step) {
      step = createDefaultRestorationStep({
        id: steps.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        plan_id: id,
        technique: `按《${plan.plan_title}》开展首道修复工序`,
        operator_id: plan.owner_id
      });
      steps.push(step);
    }
    const relic = relics.find((item) => item.id === plan.relic_id);
    if (relic) relic.current_condition = RelicCondition[3];
    return { plan: clone(plan), step: clone(step), relic: clone(relic ?? null) };
  }
};
