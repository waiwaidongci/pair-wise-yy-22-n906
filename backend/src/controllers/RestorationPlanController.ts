import type { NextFunction, Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createHttpError } from "../utils/httpError";

type Actor = { id: number; role: string };

const actorOf = (req: Request): Actor => (req as unknown as { user?: Actor }).user ?? { id: 0, role: "visitor" };

const planIdOf = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
  }
  return id;
};

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(restorationPlanService.create(req.body, actorOf(req)));
    } catch (err) {
      next(err);
    }
  },
  submit: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationPlanService.submit(planIdOf(req), actorOf(req)));
    } catch (err) {
      next(err);
    }
  },
  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationPlanService.approve(planIdOf(req), actorOf(req)));
    } catch (err) {
      next(err);
    }
  },
  reject: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationPlanService.reject(planIdOf(req), req.body?.reason, actorOf(req)));
    } catch (err) {
      next(err);
    }
  }
};
