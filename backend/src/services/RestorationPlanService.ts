import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { RelicCondition } from "../constants/RelicCondition";
import { createHttpError } from "../utils/httpError";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { createRestorationStepDto } from "../constructors/RestorationStepDtoFactory";
import type { RestorationPlan } from "../models/RestorationPlan";

type Actor = { id: number; role: string };

const SUBMITTED: PlanApprovalStatus = "SUBMITTED";
const IN_RESTORATION: RelicCondition = "IN_RESTORATION";

const mustFindPlan = (id: number): RestorationPlan => {
  const plan = restorationPlanRepository.findById(id);
  if (!plan) throw createHttpError(404, ERROR_CODES.PLAN_NOT_FOUND, ERROR_MESSAGES.PLAN_NOT_FOUND);
  return plan;
};

const mustBePending = (plan: RestorationPlan): void => {
  if (plan.approval_status !== SUBMITTED) {
    throw createHttpError(409, ERROR_CODES.PLAN_NOT_PENDING, ERROR_MESSAGES.PLAN_NOT_PENDING);
  }
};

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),

  create(payload: Partial<RestorationPlan>, actor: Actor) {
    const relicId = Number(payload.relic_id);
    if (!relicId || !payload.plan_title?.trim() || !payload.method?.trim()) {
      throw createHttpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    if (!relicItemRepository.findById(relicId)) {
      throw createHttpError(404, ERROR_CODES.RELIC_NOT_FOUND, ERROR_MESSAGES.RELIC_NOT_FOUND);
    }
    const { id: _templateId, ...draft } = createRestorationPlanDto({
      relic_id: relicId,
      damage_record_id: Number(payload.damage_record_id) || 0,
      plan_title: payload.plan_title.trim(),
      method: payload.method.trim(),
      risk_assessment: payload.risk_assessment?.trim() ?? "",
      approval_status: "DRAFT",
      owner_id: actor.id
    });
    const plan = restorationPlanRepository.create(draft);
    console.info(LOG_TEMPLATES.RestorationPlan[0], `plan#${plan.id}`, `operator#${actor.id}`);
    return plan;
  },

  submit(id: number, actor: Actor) {
    const plan = mustFindPlan(id);
    if (plan.approval_status !== "DRAFT" && plan.approval_status !== "REJECTED") {
      throw createHttpError(409, ERROR_CODES.PLAN_NOT_SUBMITTABLE, ERROR_MESSAGES.PLAN_NOT_SUBMITTABLE);
    }
    const updated = restorationPlanRepository.update(id, {
      approval_status: SUBMITTED,
      submitted_by: actor.id,
      submitted_at: new Date().toISOString()
    });
    console.info(LOG_TEMPLATES.RestorationPlan[2], `plan#${id}`, "SUBMITTED", `operator#${actor.id}`);
    return updated;
  },

  approve(id: number, actor: Actor) {
    const plan = mustFindPlan(id);
    mustBePending(plan);
    const now = new Date().toISOString();
    const updated = restorationPlanRepository.update(id, {
      approval_status: "APPROVED",
      approved_by: actor.id,
      approved_at: now
    });
    console.info(LOG_TEMPLATES.RestorationPlan[2], `plan#${id}`, "APPROVED", `operator#${actor.id}`);
    const { id: _templateId, ...stepDraft } = createRestorationStepDto({
      plan_id: id,
      step_order: "1",
      technique: "初步检查与表面清理",
      material_used: "待记录",
      operator_id: actor.id,
      step_status: "PENDING",
      finished_at: null
    });
    const step = restorationStepRepository.create(stepDraft);
    console.info(LOG_TEMPLATES.RestorationStep[0], `step#${step.id}`, `plan#${id}`, `operator#${actor.id}`);
    const relic = relicItemRepository.update(plan.relic_id, { current_condition: IN_RESTORATION });
    console.info(LOG_TEMPLATES.RelicItem[2], `relic#${plan.relic_id}`, IN_RESTORATION, `operator#${actor.id}`);
    return { plan: updated, step, relic };
  },

  reject(id: number, reason: unknown, actor: Actor) {
    const plan = mustFindPlan(id);
    mustBePending(plan);
    const trimmed = typeof reason === "string" ? reason.trim() : "";
    if (!trimmed) {
      throw createHttpError(400, ERROR_CODES.REJECT_REASON_REQUIRED, ERROR_MESSAGES.REJECT_REASON_REQUIRED);
    }
    const updated = restorationPlanRepository.update(id, {
      approval_status: "REJECTED",
      rejected_by: actor.id,
      rejected_at: new Date().toISOString(),
      reject_reason: trimmed
    });
    console.info(LOG_TEMPLATES.RestorationPlan[2], `plan#${id}`, "REJECTED", `operator#${actor.id}`, trimmed);
    return { plan: updated };
  }
};
