import { useState } from "react";
import type { RelicItem } from "../../types/RelicItem";
import type { DamageRecord } from "../../types/DamageRecord";
import type { PlanDraftPayload } from "../../api/RestorationPlan";
import { createRestorationPlanForm } from "../../constructors/RestorationPlanConstructor";

interface PlanDraftFormProps {
  relics: RelicItem[];
  damages: DamageRecord[];
  ownerId: number;
  disabled: boolean;
  onCreate: (payload: PlanDraftPayload) => Promise<void>;
}

/** 修复师编制方案：标题、关联病害/文物、修复方法、风险评估缺一不可。 */
export function PlanDraftForm({ relics, damages, ownerId, disabled, onCreate }: PlanDraftFormProps) {
  const [form, setForm] = useState(() =>
    createRestorationPlanForm({
      relic_id: relics[0]?.id ?? 1,
      damage_record_id: damages[0]?.id ?? 0,
      owner_id: ownerId
    })
  );
  const [sending, setSending] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.plan_title.trim() || !form.method.trim()) return;
    setSending(true);
    try {
      await onCreate({ ...form, plan_title: form.plan_title.trim(), method: form.method.trim() });
      setForm(createRestorationPlanForm({ relic_id: form.relic_id, damage_record_id: form.damage_record_id, owner_id: ownerId }));
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="panel draft-form" onSubmit={submit}>
      <h2>编制修复方案</h2>
      <label>
        方案标题
        <input required value={form.plan_title} onChange={(e) => set("plan_title", e.target.value)} placeholder="例如：青铜鼎裂隙矫形补焊方案" />
      </label>
      <div className="form-row">
        <label>
          关联文物
          <select value={form.relic_id} onChange={(e) => set("relic_id", Number(e.target.value))}>
            {relics.map((relic) => (
              <option key={relic.id} value={relic.id}>{relic.relic_code} · {relic.name}</option>
            ))}
          </select>
        </label>
        <label>
          关联病害
          <select value={form.damage_record_id} onChange={(e) => set("damage_record_id", Number(e.target.value))}>
            {damages.map((damage) => (
              <option key={damage.id} value={damage.id}>#{damage.id} {damage.position_desc}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        修复方法
        <textarea required rows={3} value={form.method} onChange={(e) => set("method", e.target.value)} placeholder="清理、矫形、补焊、随色做旧等工序" />
      </label>
      <label>
        风险评估
        <textarea rows={2} value={form.risk_assessment} onChange={(e) => set("risk_assessment", e.target.value)} placeholder="热影响、黏接剂老化、可逆性等风险" />
      </label>
      <button className="btn primary" type="submit" disabled={disabled || sending}>{sending ? "保存中…" : "保存为草稿"}</button>
    </form>
  );
}
