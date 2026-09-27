import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useRelicItemStore } from "../stores/RelicItemStore";
import { useDamageRecordStore } from "../stores/DamageRecordStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { EmptyState } from "../components/common/EmptyState";
import { ROLES, ROLE_TEXT, type Role } from "../constants/roles";
import { PlanApprovalStatusZh, type PlanApprovalStatus } from "../constants/PlanApprovalStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createRestorationPlanForm } from "../constructors/RestorationPlanConstructor";
import { formatDate } from "../utils/formatters";
import type { RestorationPlan } from "../types/RestorationPlan";

const FILTERS: Array<{ value: PlanApprovalStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "全部" },
  { value: "SUBMITTED", label: "待审批" },
  { value: "DRAFT", label: "草稿" },
  { value: "APPROVED", label: "已通过" },
  { value: "REJECTED", label: "已退回" }
];

const statusZh = (value: string) => PlanApprovalStatusZh[value as PlanApprovalStatus] ?? value;

export function PlansPage() {
  const [role, setRole] = useState<Role>("expert");
  const plans = useRestorationPlanStore((state) => state.rows);
  const steps = useRestorationStepStore((state) => state.rows);
  const relics = useRelicItemStore((state) => state.rows);
  const damages = useDamageRecordStore((state) => state.rows);
  const approval = usePlanApproval(role);

  const [filter, setFilter] = useState<PlanApprovalStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RestorationPlan>(() => createRestorationPlanForm());
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectHint, setRejectHint] = useState<string | null>(null);

  useEffect(() => {
    void approval.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const relicOf = useMemo(() => {
    const map = new Map(relics.map((relic) => [relic.id, relic]));
    return (id: number) => map.get(id);
  }, [relics]);

  const counts = useMemo(() => {
    const count = (status: PlanApprovalStatus) => plans.filter((plan) => plan.approval_status === status).length;
    return { submitted: count("SUBMITTED"), approved: count("APPROVED"), rejected: count("REJECTED") };
  }, [plans]);

  const filteredRows = useMemo(
    () => (filter === "ALL" ? plans : plans.filter((plan) => plan.approval_status === filter)),
    [plans, filter]
  );

  const selected = useMemo(() => {
    if (plans.length === 0) return null;
    return plans.find((plan) => plan.id === selectedId) ?? plans.find((plan) => plan.approval_status === "SUBMITTED") ?? plans[0];
  }, [plans, selectedId]);

  const selectedSteps = useMemo(
    () => (selected ? steps.filter((step) => step.plan_id === selected.id) : []),
    [steps, selected]
  );

  const selectedRelic = selected ? relicOf(selected.relic_id) : undefined;
  const selectedDamage = selected ? damages.find((damage) => damage.id === selected.damage_record_id) : undefined;
  const formDamages = useMemo(
    () => damages.filter((damage) => damage.relic_id === form.relic_id),
    [damages, form.relic_id]
  );

  const switchRole = (next: Role) => {
    setRole(next);
    setRejecting(false);
    setRejectReason("");
    setRejectHint(null);
    approval.clearMessages();
  };

  const selectPlan = (id: number) => {
    setSelectedId(id);
    setRejecting(false);
    setRejectReason("");
    setRejectHint(null);
    approval.clearMessages();
  };

  const handleCreate = async () => {
    const created = await approval.createPlan(form);
    if (created) {
      setShowForm(false);
      setForm(createRestorationPlanForm());
      setSelectedId(created.id);
    }
  };

  const handleSubmit = async (id: number) => {
    await approval.submitPlan(id);
  };

  const handleApprove = async (id: number) => {
    await approval.approvePlan(id);
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      setRejectHint(ERROR_MESSAGES.REJECT_REASON_REQUIRED);
      return;
    }
    const result = await approval.rejectPlan(id, rejectReason.trim());
    if (result) {
      setRejecting(false);
      setRejectReason("");
      setRejectHint(null);
    }
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案审批台</h1>
        </div>
        <div className="role-switch">
          <span>当前角色</span>
          {ROLES.map((item) => (
            <button key={item} className={role === item ? "active" : ""} onClick={() => switchRole(item)}>
              {ROLE_TEXT[item]}
            </button>
          ))}
        </div>
      </section>

      {approval.error ? <div className="banner error">{approval.error}</div> : null}
      {approval.notice ? <div className="banner notice">{approval.notice}</div> : null}

      <section className="metrics">
        <StatCard label="待审批方案" value={counts.submitted} />
        <StatCard label="已通过方案" value={counts.approved} />
        <StatCard label="已退回方案" value={counts.rejected} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <div className="panel-head">
            <h2>方案列表</h2>
            {role === "restorer" ? (
              <button className="primary" onClick={() => setShowForm((value) => !value)}>
                {showForm ? "收起表单" : "新建方案"}
              </button>
            ) : null}
          </div>
          <div className="filter-tabs">
            {FILTERS.map((item) => (
              <button key={item.value} className={filter === item.value ? "active" : ""} onClick={() => setFilter(item.value)}>
                {item.label}
              </button>
            ))}
          </div>

          {showForm && role === "restorer" ? (
            <div className="form-grid">
              <label>
                所属文物
                <select
                  value={form.relic_id || ""}
                  onChange={(event) => setForm({ ...form, relic_id: Number(event.target.value), damage_record_id: 0 })}
                >
                  <option value="">请选择文物</option>
                  {relics.map((relic) => (
                    <option key={relic.id} value={relic.id}>
                      {relic.name}（{relic.relic_code}）
                    </option>
                  ))}
                </select>
              </label>
              <label>
                关联病害
                <select
                  value={form.damage_record_id || ""}
                  onChange={(event) => setForm({ ...form, damage_record_id: Number(event.target.value) })}
                >
                  <option value="">不关联</option>
                  {formDamages.map((damage) => (
                    <option key={damage.id} value={damage.id}>
                      #{damage.id} {damage.damage_type} · {damage.position_desc}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                方案标题
                <input
                  value={form.plan_title}
                  placeholder="例如：青花罐冲线加固方案"
                  onChange={(event) => setForm({ ...form, plan_title: event.target.value })}
                />
              </label>
              <label>
                修复方法
                <input
                  value={form.method}
                  placeholder="例如：清洗、粘接、补配、做旧"
                  onChange={(event) => setForm({ ...form, method: event.target.value })}
                />
              </label>
              <label className="full">
                风险评估
                <textarea
                  value={form.risk_assessment}
                  placeholder="记录修复过程中的风险点与应对措施"
                  onChange={(event) => setForm({ ...form, risk_assessment: event.target.value })}
                />
              </label>
              <div className="actions full">
                <button
                  className="primary"
                  disabled={approval.acting || !form.relic_id || !form.plan_title.trim() || !form.method.trim()}
                  onClick={() => void handleCreate()}
                >
                  保存草稿
                </button>
              </div>
            </div>
          ) : null}

          <div className="table">
            {filteredRows.length === 0 ? <EmptyState title="暂无符合条件的方案" /> : null}
            {filteredRows.map((plan) => (
              <article
                key={plan.id}
                className={"row clickable" + (selected?.id === plan.id ? " selected" : "")}
                onClick={() => selectPlan(plan.id)}
              >
                <strong>
                  #{plan.id} {plan.plan_title}
                  <span className="meta">{relicOf(plan.relic_id)?.name ?? `文物 #${plan.relic_id}`}</span>
                </strong>
                <StatusBadge value={plan.approval_status} />
                <span className="meta">{statusZh(plan.approval_status)}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          {selected ? (
            <>
              <h2>方案详情</h2>
              <dl className="detail-grid">
                <dt>方案标题</dt>
                <dd>{selected.plan_title}</dd>
                <dt>所属文物</dt>
                <dd>
                  {selectedRelic ? `${selectedRelic.name}（${selectedRelic.relic_code}）` : `文物 #${selected.relic_id}`}
                  {selectedRelic ? <StatusBadge value={selectedRelic.current_condition} /> : null}
                </dd>
                <dt>关联病害</dt>
                <dd>{selectedDamage ? `#${selectedDamage.id} ${selectedDamage.damage_type} · ${selectedDamage.position_desc}` : "未关联"}</dd>
                <dt>修复方法</dt>
                <dd>{selected.method}</dd>
                <dt>风险评估</dt>
                <dd>{selected.risk_assessment || "未填写"}</dd>
                <dt>当前状态</dt>
                <dd>
                  <StatusBadge value={selected.approval_status} /> {statusZh(selected.approval_status)}
                </dd>
              </dl>

              <ApprovalTimeline plan={selected} />

              <div className="actions">
                {role === "restorer" && (selected.approval_status === "DRAFT" || selected.approval_status === "REJECTED") ? (
                  <button className="primary" disabled={approval.acting} onClick={() => void handleSubmit(selected.id)}>
                    提交审批
                  </button>
                ) : null}
                {role === "expert" && selected.approval_status === "SUBMITTED" ? (
                  <>
                    <button className="primary" disabled={approval.acting} onClick={() => void handleApprove(selected.id)}>
                      通过
                    </button>
                    <button className="danger" disabled={approval.acting} onClick={() => setRejecting((value) => !value)}>
                      退回
                    </button>
                  </>
                ) : null}
              </div>

              {role !== "expert" && selected.approval_status === "SUBMITTED" ? (
                <p className="hint">该方案正等待专家审批，请切换到「专家」角色处理。</p>
              ) : null}
              {role === "expert" && selected.approval_status !== "SUBMITTED" ? (
                <p className="hint">仅「待审批」状态的方案可以审批，当前方案已被处理。</p>
              ) : null}

              {rejecting && role === "expert" && selected.approval_status === "SUBMITTED" ? (
                <div className="reject-box">
                  <textarea
                    value={rejectReason}
                    placeholder="请填写退回原因（必填）"
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      setRejectHint(null);
                    }}
                  />
                  {rejectHint ? <p className="hint error-text">{rejectHint}</p> : null}
                  <div className="actions">
                    <button className="danger" disabled={approval.acting} onClick={() => void handleReject(selected.id)}>
                      确认退回
                    </button>
                    <button onClick={() => setRejecting(false)}>取消</button>
                  </div>
                </div>
              ) : null}

              <h2>修复步骤</h2>
              {selectedSteps.length === 0 ? (
                <EmptyState title={selected.approval_status === "APPROVED" ? "步骤生成中" : "审批通过后将自动生成第一条修复步骤"} />
              ) : (
                <ul className="steps">
                  {selectedSteps.map((step) => (
                    <li key={step.id}>
                      <div className="step-head">
                        <strong>
                          第 {step.step_order} 步 · {step.technique}
                        </strong>
                        <StatusBadge value={step.step_status} />
                      </div>
                      <span className="meta">
                        材料：{step.material_used} · 操作人 #{step.operator_id}
                        {step.finished_at ? ` · 完成于 ${formatDate(step.finished_at)}` : " · 未完成"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <EmptyState title="暂无方案，请由修复师新建" />
          )}
        </div>
      </section>
    </main>
  );
}
