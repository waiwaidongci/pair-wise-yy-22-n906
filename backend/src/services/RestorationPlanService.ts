import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { createRestorationStepDto } from "../constructors/RestorationStepDtoFactory";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { RelicCondition } from "../constants/RelicCondition";
import { UserRole } from "../constants/UserRole";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { HttpError } from "../utils/errors";
import { toAuditTarget } from "../utils/formatters";
import type { PlanApprovalPayload, RestorationPlanPayload } from "../types/RestorationPlanPayload";

export interface Operator {
  id: number;
  role: string;
}

const writeAudit = (template: string, actor: number, planId: number, extra?: string) =>
  console.info("audit", template, toAuditTarget("RestorationPlan", planId), "actor=" + actor, extra ?? "");

/** 修复师编制新方案，初始为 DRAFT。 */
export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),

  createDraft(payload: RestorationPlanPayload, operator: Operator) {
    if (!payload.plan_title || !payload.method || !payload.relic_id) {
      throw new HttpError(400, "VALIDATION_FAILED", ERROR_MESSAGES.VALIDATION_FAILED);
    }
    const row = restorationPlanRepository.insert(
      createRestorationPlanDto({
        id: restorationPlanRepository.nextId(),
        relic_id: Number(payload.relic_id),
        damage_record_id: Number(payload.damage_record_id ?? 0),
        plan_title: String(payload.plan_title),
        method: String(payload.method),
        risk_assessment: String(payload.risk_assessment ?? ""),
        owner_id: Number(payload.owner_id ?? operator.id),
        approval_status: PlanApprovalStatus[0] // DRAFT
      }) as never
    );
    writeAudit(LOG_TEMPLATES.RestorationPlan[4], row.owner_id, row.id);
    return row;
  },

  /** 修复师提交方案进入待审批。 */
  submit(id: number, operator: Operator) {
    if (operator.role !== UserRole.RESTORER) {
      throw new HttpError(403, "RBAC_DENIED", "只有修复师（RESTORER）可以提交修复方案，当前角色：" + operator.role);
    }
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw new HttpError(404, "PLAN_NOT_FOUND", ERROR_MESSAGES.PLAN_NOT_FOUND);
    if (plan.owner_id !== operator.id) {
      throw new HttpError(403, "RBAC_DENIED", "只有方案的编制人（修复师）可以提交该方案");
    }
    if (plan.approval_status !== PlanApprovalStatus[0] && plan.approval_status !== PlanApprovalStatus[3]) {
      throw new HttpError(409, "PLAN_NOT_SUBMITTED", "仅草稿或已退回的方案可以提交，当前状态：" + plan.approval_status);
    }
    const updated = restorationPlanRepository.markSubmitted(id, operator.id, new Date().toISOString());
    writeAudit(LOG_TEMPLATES.RestorationPlan[4], operator.id, id, "status=SUBMITTED");
    return updated;
  },

  /** 专家审批：通过则生成第一条修复步骤并把文物置为修复中；退回必须填写原因。 */
  review(id: number, payload: PlanApprovalPayload, operator: Operator) {
    if (operator.role !== UserRole.EXPERT) {
      throw new HttpError(403, "RBAC_DENIED", "只有专家（EXPERT）可以审批修复方案，当前角色：" + operator.role);
    }
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw new HttpError(404, "PLAN_NOT_FOUND", ERROR_MESSAGES.PLAN_NOT_FOUND);
    if (plan.approval_status !== PlanApprovalStatus[1]) {
      throw new HttpError(409, "PLAN_NOT_SUBMITTED", `只有待审批（SUBMITTED）方案可以处理，当前状态：${plan.approval_status}`);
    }

    const reviewedAt = new Date().toISOString();

    if (payload.decision === "REJECT") {
      const reason = (payload.reason ?? "").trim();
      if (!reason) {
        throw new HttpError(400, "REJECT_REASON_REQUIRED", ERROR_MESSAGES.REJECT_REASON_REQUIRED);
      }
      const updated = restorationPlanRepository.update(id, {
        approval_status: PlanApprovalStatus[3], // REJECTED
        reviewed_by: operator.id,
        reviewed_at: reviewedAt,
        reject_reason: reason
      });
      writeAudit(LOG_TEMPLATES.RestorationPlan[6], operator.id, id, "reason=" + reason);
      return { plan: updated, step: null, relic: relicItemRepository.findById(plan.relic_id) ?? null };
    }

    if (payload.decision !== "APPROVE") {
      throw new HttpError(400, "VALIDATION_FAILED", "decision 必须为 APPROVE 或 REJECT");
    }

    // 批准：幂等保护——已生成首步时不重复创建
    const existing = restorationStepRepository.findByPlanId(id);
    let step = existing[0];
    if (!step) {
      step = restorationStepRepository.insert(
        createRestorationStepDto({
          id: restorationStepRepository.nextId(),
          plan_id: id,
          step_order: 1,
          technique: `按《${plan.plan_title}》开展首道修复工序`,
          operator_id: plan.owner_id
        }) as never
      );
      writeAudit(LOG_TEMPLATES.RestorationStep[0], plan.owner_id, step.id, "plan=" + id);
    }

    const updated = restorationPlanRepository.update(id, {
      approval_status: PlanApprovalStatus[2], // APPROVED
      reviewed_by: operator.id,
      reviewed_at: reviewedAt,
      reject_reason: null
    });
    const relic = relicItemRepository.updateCondition(plan.relic_id, RelicCondition[3]); // IN_RESTORATION
    if (!relic) throw new HttpError(404, "RELIC_NOT_FOUND", ERROR_MESSAGES.RELIC_NOT_FOUND);
    writeAudit(LOG_TEMPLATES.RestorationPlan[5], operator.id, id, "status=APPROVED");
    return { plan: updated, step, relic };
  }
};
