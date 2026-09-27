import type { RelicItem } from "../../types/RelicItem";
import { StatusBadge } from "./StatusBadge";

export function RelicInfoCard({ relic }: { relic: RelicItem }) {
  return (
    <div className="relic-card">
      <div className="relic-card-head">
        <strong>{relic.name}</strong>
        <StatusBadge value={relic.current_condition} />
      </div>
      <dl className="relic-card-grid">
        <div><dt>文物编号</dt><dd>{relic.relic_code}</dd></div>
        <div><dt>年代</dt><dd>{relic.era}</dd></div>
        <div><dt>材质</dt><dd>{relic.material}</dd></div>
        <div><dt>级别</dt><dd>{relic.collection_level}</dd></div>
        <div><dt>库房位置</dt><dd>{relic.storage_location}</dd></div>
      </dl>
    </div>
  );
}
