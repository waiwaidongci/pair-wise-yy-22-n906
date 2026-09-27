import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { UserRole } from "../constants/UserRole";

const router = Router();

router.get("/", restorationPlanController.list);
// 修复师编制方案（草稿）
router.post("/", rbacMiddleware([UserRole.RESTORER]), restorationPlanController.createDraft);
// 修复师提交方案（服务层再校验是否为编制人）
router.post("/:id/submit", rbacMiddleware([UserRole.RESTORER]), restorationPlanController.submit);
// 专家审批：通过 / 退回（退回须在请求体中填写 reason）
router.post("/:id/approval", rbacMiddleware([UserRole.EXPERT]), restorationPlanController.review);

export default router;
