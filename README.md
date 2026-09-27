# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 修复方案审批台（`/plans`）

修复方案页已升级为审批台，围绕 `PlanApprovalStatus` 状态机运行：

```text
修复师编制（DRAFT） ──提交──▶ 待审批（SUBMITTED） ──专家批准──▶ 已批准（APPROVED）
                                   │                    └─ 自动生成第一条 RestorationStep
                                   │                    └─ 文物 current_condition -> IN_RESTORATION（修复中）
                                   └──专家退回（必填原因）──▶ 已退回（REJECTED） ──修改后可重新提交──▶ SUBMITTED
```

规则与接口：

- `POST /api/restoration-plan`：修复师（`RESTORER`）编制草稿，初始 `DRAFT`。
- `POST /api/restoration-plan/:id/submit`：仅方案编制人可提交（`DRAFT/REJECTED -> SUBMITTED`）。
- `POST /api/restoration-plan/:id/approval`：仅专家（`EXPERT`）可处理；body 为 `{"decision":"APPROVE"}` 或 `{"decision":"REJECT","reason":"..."}`。
- 只有 `SUBMITTED` 方案能被审批，重复审批返回 `409 PLAN_NOT_SUBMITTED`。
- 退回缺少原因返回 `400 REJECT_REASON_REQUIRED`；角色不符返回 `403 RBAC_DENIED`。
- 批准在同一事务语义下完成三件事：方案置 `APPROVED` 并记录 `reviewed_by/reviewed_at`、生成 `step_order=1` 的首条修复步骤、文物进入修复中。
- 提交/审批全程通过 `constants/logTemplates.ts` 中的「修复方案提交/批准/退回」模板写审计日志。
- 页面右上角可切换演示身份（修复师/专家），处理后列表保留、详情即时展示新状态、审批留痕与首条步骤。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。
- 身份通过请求头 `x-user-id` 与 `x-role` 传递（演示用）；后端不可达时前端自动回退到 `mocks/mockPlanClient`，审批状态机与接口行为一致。

接口快速验证：

```bash
curl -X POST http://localhost:21110/api/restoration-plan/1/approval \
  -H 'Content-Type: application/json' -H 'x-role: EXPERT' -H 'x-user-id: 201' \
  -d '{"decision":"APPROVE"}'
```


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition（STABLE / FRAGILE / DAMAGED / IN_RESTORATION / SEALED）：
  前端 `constants/RelicCondition.ts`、`types/RelicCondition.ts`、`constants/statusText.ts`、`components/common/StatusBadge.tsx`、`components/common/RelicInfoCard.tsx`、`components/plans/PlanDetail.tsx`；
  后端 `constants/RelicCondition.ts`、`services/RestorationPlanService.ts`（批准后置 IN_RESTORATION）、`repositories/RelicItemRepository.ts`、种子数据。
- PlanApprovalStatus（DRAFT / SUBMITTED / APPROVED / REJECTED / ARCHIVED）：
  前端 `constants/PlanApprovalStatus.ts`、`types/PlanApprovalStatus.ts`、`types/RestorationPlan.ts`、`constants/statusText.ts`、`constructors/RestorationPlanConstructor.ts`、`hooks/usePlanApproval.ts`、`mocks/mockPlanClient.ts`、`pages/PlansPage.tsx` 筛选器、`components/plans/*`、`components/common/ApprovalTimeline.tsx`；
  后端 `constants/PlanApprovalStatus.ts`、`models/RestorationPlan.ts`、`constructors/RestorationPlanDtoFactory.ts`、`repositories/RestorationPlanRepository.ts`、`services/RestorationPlanService.ts`、`controllers/RestorationPlanController.ts`、`routes/RestorationPlanRoutes.ts`、种子数据与 `database/init.sql`。
- DamageSeverity（LOW / MEDIUM / HIGH / CRITICAL）：
  前端 `constants/DamageSeverity.ts`、`types/DamageSeverity.ts`、`constants/statusText.ts`、`components/common/SeverityBadge.tsx`、`components/plans/PlanDetail.tsx`；
  后端 `constants/DamageSeverity.ts`、种子数据。
- UserRole（RESTORER / EXPERT / ARCHIVIST / VISITOR）：
  前端 `constants/UserRole.ts`、`stores/SessionStore.ts`、`hooks/usePlanApproval.ts`、`pages/PlansPage.tsx`；
  后端 `constants/UserRole.ts`、`middlewares/authMiddleware.ts`、`middlewares/rbacMiddleware.ts`、`routes/RestorationPlanRoutes.ts`、`services/RestorationPlanService.ts`。
- 审批相关错误码：`PLAN_NOT_FOUND / PLAN_NOT_SUBMITTED / REJECT_REASON_REQUIRED / RELIC_NOT_FOUND` 在前后端 `constants/errorCodes.ts` 与 `errorMessages.ts` 双端同步。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
