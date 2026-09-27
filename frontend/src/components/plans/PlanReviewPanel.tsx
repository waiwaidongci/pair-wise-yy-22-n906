import { useState } from "react";
import { PlanApprovalStatus } from "../../constants/PlanApprovalStatus";
import type { PlanApprovalRequest } from "../../api/RestorationPlan";
import type { RestorationPlan } from "../../types/RestorationPlan";

interface PlanReviewPanelProps {
  plan: RestorationPlan;
  acting: boolean;
  onReview: (payload: PlanApprovalRequest) => Promise<void>;
}

/** 专家审批台：只有待审批方案可操作；退回必须填写原因。 */
export function PlanReviewPanel({ plan, acting, onReview }: PlanReviewPanelProps) {
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"IDLE" | "REJECT">("IDLE");
  const pending = plan.approval_status === PlanApprovalStatus[1];

  if (!pending) {
    return (
      <div className="review-panel locked">
        <h2>专家审批</h2>
        <p className="lock-tip">
          当前方案为「{plan.approval_status}」，只有待审批（SUBMITTED）方案才能通过或退回，请勿重复审批。
        </p>
        {plan.approval_status === PlanApprovalStatus[3] && plan.reject_reason && (
          <p className="reject-reason">退回原因：{plan.reject_reason}</p>
        )}
      </div>
    );
  }

  const approve = async () => {
    await onReview({ decision: "APPROVE" });
    setMode("IDLE");
    setReason("");
  };

  const confirmReject = async () => {
    if (!reason.trim()) return;
    await onReview({ decision: "REJECT", reason: reason.trim() });
    setMode("IDLE");
    setReason("");
  };

  return (
    <div className="review-panel">
      <h2>专家审批</h2>
      <p className="review-tip">该方案已由修复师提交，请核验修复方法与风险评估后给出结论。</p>
      {mode === "REJECT" ? (
        <div className="reject-form">
          <label>
            退回原因 <span className="required">*</span>
            <textarea
              rows={3}
              value={reason}
              autoFocus
              placeholder="请填写退回原因，修复师将据此修改（必填）"
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="review-actions">
            <button className="btn" type="button" disabled={acting} onClick={() => setMode("IDLE")}>取消</button>
            <button className="btn danger" type="button" disabled={acting || !reason.trim()} onClick={confirmReject}>
              {acting ? "提交中…" : "确认退回"}
            </button>
          </div>
          {!reason.trim() && <p className="field-hint">退回原因不能为空</p>}
        </div>
      ) : (
        <div className="review-actions">
          <button className="btn danger" type="button" disabled={acting} onClick={() => setMode("REJECT")}>退回（需填原因）</button>
          <button className="btn primary" type="button" disabled={acting} onClick={approve}>
            {acting ? "处理中…" : "批准并生成首道步骤"}
          </button>
        </div>
      )}
    </div>
  );
}
