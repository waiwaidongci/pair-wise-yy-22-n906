import type { NextFunction, Request, Response } from "express";
import { restorationPlanService, type Operator } from "../services/RestorationPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

const readOperator = (req: Request): Operator => ({
  id: Number(req.header("x-user-id")) || (req as any).user?.id || 0,
  role: req.header("x-role") ?? (req as any).user?.role ?? "VISITOR"
});

/** 控制器层再包一层异常，避免业务错误泄漏为未处理异常。 */
const send = (handler: (req: Request, res: Response) => unknown) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await handler(req, res);
    res.json(data);
  } catch (err) {
    if (!(err as { status?: number }).status) {
      (err as { status?: number; code?: string }).status = 500;
      (err as { code?: string }).code = ERROR_CODES.VALIDATION_FAILED;
      (err as Error).message = ERROR_MESSAGES.VALIDATION_FAILED;
    }
    next(err);
  }
};

export const restorationPlanController = {
  list: send(() => restorationPlanService.list()),
  createDraft: send((req, res) => {
    res.status(201);
    return restorationPlanService.createDraft(req.body, readOperator(req));
  }),
  submit: send((req, res) => {
    res.status(202);
    return restorationPlanService.submit(Number(req.params.id), readOperator(req));
  }),
  review: send((req, res) => {
    res.status(202);
    return restorationPlanService.review(Number(req.params.id), req.body, readOperator(req));
  })
};
