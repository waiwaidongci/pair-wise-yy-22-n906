import type { RestorationPlan } from "../../types/RestorationPlan";
import type { RestorationStep } from "../../types/RestorationStep";
import type { RelicItem } from "../../types/RelicItem";
import type { DamageRecord } from "../../types/DamageRecord";
import { PlanApprovalStatus } from "../../constants/PlanApprovalStatus";
import { UserRole } from "../../constants/UserRole";
import { StatusBadge } from "../common/StatusBadge";
import { SeverityBadge } from "../common/SeverityBadge";
import { RelicInfoCard } from "../common/RelicInfoCard";
import { ApprovalTimeline } from "../common/ApprovalTimeline";
import { StepList } from "../common/StepList";
import { EmptyState } from "../common/EmptyState";
import { PlanReviewPanel } from "./PlanReviewPanel";
import { formatDateTime } from "../../utils/formatters";
import type { PlanApprovalRequest } from "../../api/RestorationPlan";

interface PlanDetailProps {
  plan: RestorationPlan | null;
  relic?: RelicItem;
  damage?: DamageRecord;
  steps: RestorationStep[];
  role: string;
  isOwner: boolean;
  acting: boolean;
  onSubmit: (plan: RestorationPlan) => Promise<void>;
  onReview: (plan: RestorationPlan, payload: PlanApprovalRequest) => Promise<void>;
  operatorName: (id: number | null) => string;
}

/** 方案详情：保留全部既有信息，并按角色挂载提交 / 审批动作。 */
export function PlanDetail({
  plan,
  relic,
  damage,
  steps,
  role,
  isOwner,
  acting,
  onSubmit,
  onReview,
  operatorName
}: PlanDetailProps) {
  if (!plan) return <EmptyState title="请选择左侧方案查看详情" />;

  const isDraft = plan.approval_status === PlanApprovalStatus[0] || plan.approval_status === PlanApprovalStatus[3];
  const canSubmit = role === UserRole.RESTORER && isOwner && isDraft;

  return (
    <div className="plan-detail">
      <div className="panel">
        <div className="detail-head">
          <div>
            <h2>{plan.plan_title}</h2>
            <p className="detail-sub">方案编号 #{plan.id} · 编制人 {operatorName(plan.owner_id)} · {formatDateTime(plan.submitted_at) !== "—" ? `提交于 ${formatDateTime(plan.submitted_at)}` : "尚未提交"}</p>
          </div>
          <StatusBadge value={plan.approval_status} />
        </div>

        {plan.approval_status === PlanApprovalStatus[3] && plan.reject_reason && (
          <div className="reject-box">
            <strong>专家退回原因</strong>
            <p>{plan.reject_reason}</p>
            <span>审批人：{operatorName(plan.reviewed_by)} · {formatDateTime(plan.reviewed_at)}</span>
          </div>
        )}

        <dl className="detail-grid">
          <div><dt>修复方法</dt><dd>{plan.method}</dd></div>
          <div><dt>风险评估</dt><dd>{plan.risk_assessment || "—"}</dd></div>
          {damage && (
            <div>
              <dt>关联病害</dt>
              <dd>{damage.position_desc} <SeverityBadge value={damage.severity} /></dd>
            </div>
          )}
        </dl>

        {canSubmit && (
          <div className="detail-actions">
            <button className="btn primary" type="button" disabled={acting} onClick={() => onSubmit(plan)}>
              {plan.approval_status === PlanApprovalStatus[3] ? "修改完毕，重新提交" : "提交方案送审"}
            </button>
          </div>
        )}
        {role === UserRole.RESTORER && !canSubmit && isDraft && !isOwner && (
          <p className="field-hint">只有该方案的编制人可以提交。</p>
        )}
      </div>

      {relic && <RelicInfoCard relic={relic} />}

      {role === UserRole.EXPERT && <PlanReviewPanel plan={plan} acting={acting} onReview={(payload) => onReview(plan, payload)} />}

      <div className="panel">
        <h2>审批留痕</h2>
        <ApprovalTimeline plan={plan} users={{ name: operatorName }} />
      </div>

      <div className="panel">
        <h2>修复步骤</h2>
        <StepList steps={steps} operatorName={operatorName} />
      </div>
    </div>
  );
}
