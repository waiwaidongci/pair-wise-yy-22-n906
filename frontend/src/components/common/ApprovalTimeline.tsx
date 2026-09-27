import type { RestorationPlan } from "../../types/RestorationPlan";
import { PlanApprovalStatus } from "../../constants/PlanApprovalStatus";
import { UserRoleText } from "../../constants/UserRole";
import { formatDateTime } from "../../utils/formatters";

interface OperatorLookup {
  name: (id: number | null) => string;
}

const roleOf = (id: number | null) => (id != null && id >= 200 ? UserRoleText.EXPERT : UserRoleText.RESTORER);

/** 方案审批时间线：编制 → 提交 → 批准/退回。 */
export function ApprovalTimeline({ plan, users }: { plan: RestorationPlan; users: OperatorLookup }) {
  const rejected = plan.approval_status === PlanApprovalStatus[3];
  const approved = plan.approval_status === PlanApprovalStatus[2];
  const pending = plan.approval_status === PlanApprovalStatus[1];

  return (
    <ol className="timeline">
      <li className="timeline-item done">
        <span className="timeline-dot" />
        <div>
          <strong>方案编制</strong>
          <p>{users.name(plan.owner_id)}（{roleOf(plan.owner_id)}）</p>
        </div>
      </li>
      <li className={"timeline-item " + (plan.submitted_at ? "done" : "")}>
        <span className="timeline-dot" />
        <div>
          <strong>提交送审</strong>
          <p>{plan.submitted_at ? `${users.name(plan.submitted_by)} · ${formatDateTime(plan.submitted_at)}` : "尚未提交"}</p>
        </div>
      </li>
      <li className={"timeline-item " + (approved || rejected ? "done " + (rejected ? "rejected" : "") : pending ? "active" : "")}>
        <span className="timeline-dot" />
        <div>
          <strong>{rejected ? "专家退回" : approved ? "专家批准" : "专家审批"}</strong>
          <p>
            {plan.reviewed_at
              ? `${users.name(plan.reviewed_by)}（${UserRoleText.EXPERT}） · ${formatDateTime(plan.reviewed_at)}`
              : pending
                ? "等待专家处理"
                : "尚未进入审批"}
          </p>
          {rejected && plan.reject_reason && <p className="timeline-reason">退回原因：{plan.reject_reason}</p>}
        </div>
      </li>
    </ol>
  );
}
