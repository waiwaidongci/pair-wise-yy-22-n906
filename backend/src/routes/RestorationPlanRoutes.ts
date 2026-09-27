import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";
import { ROLES } from "../constants/roles";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", rbacMiddleware([ROLES.RESTORER]), restorationPlanController.create);
router.post("/:id/submit", rbacMiddleware([ROLES.RESTORER]), restorationPlanController.submit);
router.post("/:id/approve", rbacMiddleware([ROLES.EXPERT]), restorationPlanController.approve);
router.post("/:id/reject", rbacMiddleware([ROLES.EXPERT]), restorationPlanController.reject);
export default router;
