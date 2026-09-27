import { DamageSeverityText } from "../../constants/DamageSeverity";

export function SeverityBadge({ value }: { value: string }) {
  const text = DamageSeverityText[value as keyof typeof DamageSeverityText] ?? value;
  return <span className={"badge severity " + String(value).toLowerCase().replace(/_/g, "-")}>{text}</span>;
}
