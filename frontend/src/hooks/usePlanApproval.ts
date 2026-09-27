import { useCallback, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useSessionStore } from "../stores/SessionStore";
import { describeApprovalError, type PlanDraftPayload, type PlanApprovalRequest } from "../api/RestorationPlan";
import { PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { UserRole } from "../constants/UserRole";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationPlan, PlanReviewResult } from "../types/RestorationPlan";

export type ApprovalAction = "create" | "submit" | "approve" | "reject";

const ACTOR_TEMPLATE: Record<ApprovalAction, string> = {
  create: LOG_TEMPLATES.RestorationPlan[4],
  submit: LOG_TEMPLATES.RestorationPlan[4],
  approve: LOG_TEMPLATES.RestorationPlan[5],
  reject: LOG_TEMPLATES.RestorationPlan[6]
};

export function usePlanApproval() {
  const [acting, setActing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastResult, setLastResult] = useState<PlanReviewResult | null>(null);

  // 只订阅需要的 action / 数据，保证回调引用稳定。
  const createDraftAction = useRestorationPlanStore((s) => s.createDraft);
  const submitPlanAction = useRestorationPlanStore((s) => s.submit);
  const reviewPlanAction = useRestorationPlanStore((s) => s.review);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const loadRelics = useRelicItemStore((s) => s.load);
  const user = useSessionStore((state) => state.user);
  const actor = { userId: user.id, role: user.role };

  const isExpert = user.role === UserRole.EXPERT;
  const isRestorer = user.role === UserRole.RESTORER;

  const fail = useCallback((text: string) => {
    setNotice({ type: "error", text });
    return Promise.reject(new Error(text));
  }, []);

  const run = useCallback(
    async (action: ApprovalAction, task: () => Promise<unknown>, successText: string) => {
      setActing(true);
      setNotice(null);
      console.info("audit", ACTOR_TEMPLATE[action], "actor=" + user.id, user.name);
      try {
        const result = await task();
        await Promise.all([loadSteps(), loadRelics()]);
        setNotice({ type: "success", text: successText });
        return result;
      } catch (err) {
        setNotice({ type: "error", text: describeApprovalError(err) });
        throw err;
      } finally {
        setActing(false);
      }
    },
    [user.id, user.name, loadSteps, loadRelics]
  );

  const createDraft = useCallback(
    (payload: PlanDraftPayload) =>
      run("create", () => createDraftAction(payload, actor), "方案已编制并保存为草稿"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run, createDraftAction, user.id, user.role]
  );

  const submit = useCallback(
    (plan: RestorationPlan) => {
      if (!isRestorer) return fail("只有修复师可以提交方案，当前角色无法操作");
      if (plan.owner_id !== user.id) return fail("只有该方案的编制人可以提交");
      return run("submit", () => submitPlanAction(plan.id, actor), "方案已提交，等待专家审批");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run, submitPlanAction, fail, isRestorer, user.id, user.role]
  );

  const review = useCallback(
    (plan: RestorationPlan, payload: PlanApprovalRequest) => {
      if (!isExpert) return fail("只有专家（EXPERT）可以审批方案，当前角色无法操作");
      if (plan.approval_status !== PlanApprovalStatus[1]) {
        return fail(`只有待审批方案可以处理，当前状态为「${plan.approval_status}」，请勿重复审批`);
      }
      if (payload.decision === "REJECT" && !(payload.reason ?? "").trim()) {
        return fail("退回方案必须填写退回原因");
      }
      return run(
        payload.decision === "APPROVE" ? "approve" : "reject",
        async () => {
          const result = await reviewPlanAction(plan.id, payload, actor);
          setLastResult(result);
          return result;
        },
        payload.decision === "APPROVE" ? "方案已批准，已生成第一条修复步骤，文物进入修复中" : "方案已退回，修复师可修改后重新提交"
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run, reviewPlanAction, fail, isExpert, user.id, user.role]
  );

  return {
    acting,
    notice,
    setNotice,
    lastResult,
    isExpert,
    isRestorer,
    createDraft,
    submit,
    review
  };
}
