import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";
import type { RestorationPlan } from "../../types/RestorationPlan";

type TimelineEvent = { label: string; at?: string | null; by?: number | null; note?: string | null };

export function ApprovalTimeline({ title = "审批时间线", plan }: { title?: string; plan?: RestorationPlan }) {
  if (!plan) {
    return <div className="shared-widget"><strong>{title}</strong><StatusBadge value="READY" /></div>;
  }
  const events: TimelineEvent[] = ([
    { label: "方案编制", by: plan.owner_id },
    plan.submitted_at ? { label: "提交审批", by: plan.submitted_by, at: plan.submitted_at } : null,
    plan.approved_at ? { label: "审批通过", by: plan.approved_by, at: plan.approved_at } : null,
    plan.rejected_at ? { label: "审批退回", by: plan.rejected_by, at: plan.rejected_at, note: plan.reject_reason } : null
  ] as (TimelineEvent | null)[]).filter((event): event is TimelineEvent => event !== null);
  return (
    <div className="shared-widget timeline">
      <div className="timeline-head">
        <strong>{title}</strong>
        <StatusBadge value={plan.approval_status} />
      </div>
      <ul>
        {events.map((event) => (
          <li key={event.label}>
            <span className="dot" aria-hidden="true" />
            <div>
              <strong>{event.label}</strong>
              <span className="meta">
                操作人 #{event.by ?? "-"}
                {event.at ? ` · ${formatDate(event.at)}` : ""}
              </span>
              {event.note ? <span className="note">退回原因：{event.note}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
