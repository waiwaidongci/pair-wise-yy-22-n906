import { STATUS_TEXT } from "../../constants/statusText";

const toText = (value: string) =>
  STATUS_TEXT.PlanApprovalStatus[value as keyof typeof STATUS_TEXT.PlanApprovalStatus] ??
  STATUS_TEXT.RelicCondition[value as keyof typeof STATUS_TEXT.RelicCondition] ??
  STATUS_TEXT.DamageSeverity[value as keyof typeof STATUS_TEXT.DamageSeverity] ??
  value.replace(/_/g, " ");

export function StatusBadge({ value }: { value: string }) {
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{toText(value)}</span>;
}
