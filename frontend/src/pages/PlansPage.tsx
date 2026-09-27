import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { sessionUsers, useSessionStore } from "../stores/SessionStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { usePagination } from "../hooks/usePagination";
import { PlanApprovalStatus, PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { UserRole, UserRoleText } from "../constants/UserRole";
import type { RestorationPlan } from "../types/RestorationPlan";
import { PlanCard } from "../components/plans/PlanCard";
import { PlanDetail } from "../components/plans/PlanDetail";
import { PlanDraftForm } from "../components/plans/PlanDraftForm";
import { EmptyState } from "../components/common/EmptyState";

const FILTERS = ["ALL", ...PlanApprovalStatus] as const;

export function PlansPage() {
  const plans = useRestorationPlanStore((s) => s.rows);
  const loadPlans = useRestorationPlanStore((s) => s.load);
  const steps = useRestorationStepStore((s) => s.rows);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const relics = useRelicItemStore((s) => s.rows);
  const loadRelics = useRelicItemStore((s) => s.load);
  const damages = useDamageRecordStore((s) => s.rows);
  const loadDamages = useDamageRecordStore((s) => s.load);

  const { user, setUser } = useSessionStore();
  const approval = usePlanApproval();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    void loadPlans();
    void loadSteps();
    void loadRelics();
    void loadDamages();
  }, [loadPlans, loadSteps, loadRelics, loadDamages]);

  const operatorName = (id: number | null) => sessionUsers.find((item) => item.id === id)?.name ?? (id != null ? `用户#${id}` : "—");
  const relicById = (id: number) => relics.find((item) => item.id === id);
  const damageById = (id: number) => damages.find((item) => item.id === id);

  const filtered = useMemo(
    () => (filter === "ALL" ? plans : plans.filter((plan) => plan.approval_status === filter)),
    [plans, filter]
  );
  const { pageRows, page, setPage, pageSize, total } = usePagination(filtered);

  // 列表始终保留；默认选中第一条待审批方案，处理后保持选中以便看到新状态与步骤。
  const selected: RestorationPlan | null = useMemo(() => {
    const direct = plans.find((plan) => plan.id === selectedId);
    if (direct) return direct;
    return plans.find((plan) => plan.approval_status === PlanApprovalStatus[1]) ?? plans[0] ?? null;
  }, [plans, selectedId]);

  const selectedSteps = useMemo(
    () => steps.filter((step) => step.plan_id === selected?.id),
    [steps, selected]
  );

  const pendingCount = plans.filter((plan) => plan.approval_status === PlanApprovalStatus[1]).length;

  return (
    <main className="page plans-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore · 审批台</p>
          <h1>修复方案审批台</h1>
          <p className="page-desc">修复师编制并提交方案，专家通过或退回；批准后自动生成第一条修复步骤，文物进入修复中。</p>
        </div>
        <div className="role-switch">
          <span className="role-label">当前身份</span>
          <select
            value={user.id}
            onChange={(e) => {
              setUser(Number(e.target.value));
              approval.setNotice(null);
            }}
          >
            {sessionUsers.map((item) => (
              <option key={item.id} value={item.id}>{item.name} · {UserRoleText[item.role as UserRole] ?? item.role}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="metrics">
        <div className="stat"><span>全部方案</span><strong>{plans.length}</strong></div>
        <div className="stat"><span>待专家审批</span><strong className="accent">{pendingCount}</strong></div>
        <div className="stat"><span>当前角色</span><strong>{UserRoleText[user.role as UserRole] ?? user.role}</strong></div>
      </section>

      {approval.notice && (
        <div className={"notice " + approval.notice.type} role="alert">
          <span>{approval.notice.text}</span>
          <button type="button" onClick={() => approval.setNotice(null)}>×</button>
        </div>
      )}

      <section className="plans-layout">
        <div className="plans-list-col">
          {approval.isRestorer && (
            <PlanDraftForm
              relics={relics}
              damages={damages}
              ownerId={user.id}
              disabled={approval.acting}
              onCreate={async (payload) => {
                await approval.createDraft(payload);
              }}
            />
          )}

          <div className="panel">
            <div className="list-head">
              <h2>已有方案</h2>
              <div className="filter-tabs">
                {FILTERS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={filter === key ? "active" : ""}
                    onClick={() => {
                      setFilter(key);
                      setPage(1);
                    }}
                  >
                    {key === "ALL" ? "全部" : PlanApprovalStatusText[key]}
                  </button>
                ))}
              </div>
            </div>

            {pageRows.length === 0 ? (
              <EmptyState title="该状态下暂无方案" />
            ) : (
              <div className="plan-cards">
                {pageRows.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    relic={relicById(plan.relic_id)}
                    ownerName={operatorName(plan.owner_id)}
                    selected={selected?.id === plan.id}
                    onSelect={() => setSelectedId(plan.id)}
                  />
                ))}
              </div>
            )}

            {total > pageSize && (
              <div className="pager">
                <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button>
                <span>第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</span>
                <button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)}>下一页</button>
              </div>
            )}
          </div>
        </div>

        <div className="plans-detail-col">
          <PlanDetail
            plan={selected}
            relic={selected ? relicById(selected.relic_id) : undefined}
            damage={selected ? damageById(selected.damage_record_id) : undefined}
            steps={selectedSteps}
            role={user.role}
            isOwner={selected?.owner_id === user.id}
            acting={approval.acting}
            onSubmit={async (plan) => {
              await approval.submit(plan).catch(() => undefined);
            }}
            onReview={async (plan, payload) => {
              await approval.review(plan, payload).catch(() => undefined);
            }}
            operatorName={operatorName}
          />
        </div>
      </section>
    </main>
  );
}
