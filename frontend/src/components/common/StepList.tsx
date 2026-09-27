import type { RestorationStep } from "../../types/RestorationStep";
import { formatDateTime } from "../../utils/formatters";

interface StepListProps {
  steps: RestorationStep[];
  operatorName?: (id: number | null) => string;
  emptyText?: string;
}

const stepStatusText: Record<string, string> = { PENDING: "待执行", IN_PROGRESS: "执行中", FINISHED: "已完成" };

/** 方案详情中的修复步骤列表；批准后至少存在第一条步骤。 */
export function StepList({ steps, operatorName, emptyText = "暂无修复步骤（方案批准后自动生成第一条）" }: StepListProps) {
  if (steps.length === 0) return <div className="empty">{emptyText}</div>;
  return (
    <ol className="step-list">
      {[...steps]
        .sort((a, b) => a.step_order - b.step_order)
        .map((step) => (
          <li key={step.id} className="step-item">
            <span className="step-order">第 {step.step_order} 步</span>
            <div className="step-body">
              <div className="step-head">
                <strong>{step.technique}</strong>
                <span className={"badge " + step.step_status.toLowerCase().replace(/_/g, "-")}>
                  {stepStatusText[step.step_status] ?? step.step_status}
                </span>
              </div>
              <p className="step-meta">材料：{step.material_used}</p>
              <p className="step-meta">
                操作人：{operatorName ? operatorName(step.operator_id) : step.operator_id} · 完成时间：{formatDateTime(step.finished_at)}
              </p>
            </div>
            <span className="step-status-text">{stepStatusText[step.step_status] ?? step.step_status}</span>
          </li>
        ))}
    </ol>
  );
}
