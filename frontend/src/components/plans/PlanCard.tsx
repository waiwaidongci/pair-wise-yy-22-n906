import { StatusBadge } from "../common/StatusBadge";
import { PlanApprovalStatus } from "../../constants/PlanApprovalStatus";
import { formatDateTime } from "../../utils/formatters";
import type { RestorationPlan } from "../../types/RestorationPlan";
import type { RelicItem } from "../../types/RelicItem";

interface PlanCardProps {
  plan: RestorationPlan;
  relic?: RelicItem;
  ownerName: string;
  selected: boolean;
  onSelect: () => void;
}

const statusHint: Record<string, string> = {
  DRAFT: "修复师仍可编辑并提交",
  SUBMITTED: "等待专家审批",
  APPROVED: "已生成修复步骤",
  REJECTED: "已退回，可修改后重新提交",
  ARCHIVED: "已归档"
};

/** 已有方案列表中的单条卡片，点击后在右侧打开详情，列表本身始终保留。 */
export function PlanCard({ plan, relic, ownerName, selected, onSelect }: PlanCardProps) {
  const pending = plan.approval_status === PlanApprovalStatus[1];
  return (
    <button type="button" className={"plan-card" + (selected ? " selected" : "") + (pending ? " pending" : "")} onClick={onSelect}>
      <div className="plan-card-head">
        <strong>{plan.plan_title}</strong>
        <StatusBadge value={plan.approval_status} />
      </div>
      <p className="plan-card-sub">{relic ? `${relic.relic_code} · ${relic.name}` : `文物 #${plan.relic_id}`}</p>
      <p className="plan-card-meta">
        <span>编制：{ownerName}</span>
        {plan.submitted_at && <span>提交：{formatDateTime(plan.submitted_at)}</span>}
      </p>
      <p className="plan-card-hint">{statusHint[plan.approval_status] ?? ""}</p>
      {pending && <span className="plan-card-flag">待处理</span>}
    </button>
  );
}
