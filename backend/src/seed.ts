export const seed = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "BRONZE-001",
      "name": "青铜饕餮纹鼎",
      "era": "商代晚期",
      "material": "青铜",
      "collection_level": "一级",
      "storage_location": "金属器库房 A-12",
      "current_condition": "DAMAGED"
    },
    {
      "id": 2,
      "relic_code": "JADE-014",
      "name": "谷纹玉璧",
      "era": "战国",
      "material": "和田青玉",
      "collection_level": "二级",
      "storage_location": "玉石器库房 B-07",
      "current_condition": "FRAGILE"
    },
    {
      "id": 3,
      "relic_code": "PAINT-228",
      "name": "彩绘陶仕女俑",
      "era": "唐代",
      "material": "彩绘陶",
      "collection_level": "一级",
      "storage_location": "陶器库房 C-03",
      "current_condition": "STABLE"
    }
  ],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "CRACK",
      "position_desc": "鼎腹部至左口沿纵向裂隙，长约 12cm",
      "severity": "HIGH",
      "discovered_by": "王修复",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image_url-1.png",
      "status": "SUBMITTED"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "SURFACE_LOSS",
      "position_desc": "玉璧边缘崩缺两处",
      "severity": "MEDIUM",
      "discovered_by": "李修复",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image_url-2.png",
      "status": "APPROVED"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "PAINT_PEELING",
      "position_desc": "仕女俑发髻彩绘起翘剥落",
      "severity": "MEDIUM",
      "discovered_by": "赵修复",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image_url-3.png",
      "status": "DRAFT"
    }
  ],
  "restorationPlan": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "青铜鼎裂隙矫形补焊方案",
      "method": "机械清理裂隙污垢后采用锡铅合金低温补焊，随形矫形，随色做旧",
      "risk_assessment": "HIGH：补焊热影响区可能加剧周边矿化，需控制温度并分段作业",
      "approval_status": "SUBMITTED",
      "owner_id": 101,
      "submitted_by": 101,
      "submitted_at": "2026-09-20T03:10:00Z",
      "reviewed_by": null,
      "reviewed_at": null,
      "reject_reason": null
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "plan_title": "玉璧崩缺黏接补配方案",
      "method": "环氧树脂黏接崩口，同色矿物粉补缺并打磨随形",
      "risk_assessment": "MEDIUM：黏接剂老化可逆性需定期复查",
      "approval_status": "APPROVED",
      "owner_id": 102,
      "submitted_by": 102,
      "submitted_at": "2026-09-05T07:30:00Z",
      "reviewed_by": 201,
      "reviewed_at": "2026-09-06T02:00:00Z",
      "reject_reason": null
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_record_id": 3,
      "plan_title": "彩绘俑发髻回贴方案（草稿）",
      "method": "待补充黏结剂选型与回贴顺序",
      "risk_assessment": "待评估",
      "approval_status": "DRAFT",
      "owner_id": 103,
      "submitted_by": null,
      "submitted_at": null,
      "reviewed_by": null,
      "reviewed_at": null,
      "reject_reason": null
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 2,
      "step_order": 1,
      "technique": "断面清理与环氧黏接",
      "material_used": "EPO-TEK 301 环氧树脂、无水乙醇",
      "operator_id": 102,
      "step_status": "FINISHED",
      "finished_at": "2026-09-08T10:30:00Z"
    }
  ],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "v1",
      "image_type": "BEFORE",
      "file_path": "/mock/bronze-ding-before.jpg",
      "capture_at": "2026-06-11T09:00:00Z",
      "note": "入馆病害影像"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "v1",
      "image_type": "BEFORE",
      "file_path": "/mock/jade-bi-before.jpg",
      "capture_at": "2026-06-12T09:00:00Z",
      "note": "崩缺原始影像"
    },
    {
      "id": 3,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "v2",
      "image_type": "AFTER",
      "file_path": "/mock/jade-bi-after.jpg",
      "capture_at": "2026-09-09T09:00:00Z",
      "note": "黏接补配完成影像"
    }
  ],
  // 用户目录：修复师编制方案，专家负责审批
  "user": [
    { "id": 101, "name": "王修复", "role": "RESTORER" },
    { "id": 102, "name": "李修复", "role": "RESTORER" },
    { "id": 103, "name": "赵修复", "role": "RESTORER" },
    { "id": 201, "name": "周专家", "role": "EXPERT" },
    { "id": 202, "name": "陈专家", "role": "EXPERT" }
  ]
} as const;
