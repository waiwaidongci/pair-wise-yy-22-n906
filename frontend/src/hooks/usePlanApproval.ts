import { useCallback, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import {
  approveRestorationPlan,
  createRestorationPlan,
  rejectRestorationPlan,
  submitRestorationPlan
} from "../api/RestorationPlan";
import type { PlanApprovalResult, RestorationPlan } from "../types/RestorationPlan";
import type { Role } from "../constants/roles";

const toMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

export function usePlanApproval(role: Role) {
  const planStore = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const relicStore = useRelicItemStore();
  const damageStore = useDamageRecordStore();
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    await Promise.all([planStore.load(), stepStore.load(), relicStore.load(), damageStore.load()]);
  }, [planStore, stepStore, relicStore, damageStore]);

  const run = useCallback(
    async <T>(action: () => Promise<T>, done: string): Promise<T | null> => {
      setActing(true);
      setError(null);
      setNotice(null);
      try {
        const result = await action();
        await refresh();
        setNotice(done);
        return result;
      } catch (err) {
        setError(toMessage(err));
        return null;
      } finally {
        setActing(false);
      }
    },
    [refresh]
  );

  return {
    acting,
    error,
    notice,
    refresh,
    clearMessages: () => {
      setError(null);
      setNotice(null);
    },
    createPlan: (payload: Partial<RestorationPlan>) =>
      run(() => createRestorationPlan(payload, role), "方案已保存为草稿，可提交专家审批"),
    submitPlan: (id: number) =>
      run(() => submitRestorationPlan(id, role), "方案已提交，等待专家审批"),
    approvePlan: (id: number): Promise<PlanApprovalResult | null> =>
      run(() => approveRestorationPlan(id, role), "审批通过：已生成第一条修复步骤，文物进入修复中"),
    rejectPlan: (id: number, reason: string) =>
      run(() => rejectRestorationPlan(id, reason, role), "方案已退回，等待修复师修改")
  };
}
