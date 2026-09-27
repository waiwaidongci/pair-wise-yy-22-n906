import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  if (roles.length === 0) return next();
  const role: string = req.header("x-role") ?? (req as any).user?.role ?? "VISITOR";
  if (!roles.includes(role)) {
    res.status(403).json({
      code: ERROR_CODES.RBAC_DENIED,
      message: `${ERROR_MESSAGES.RBAC_DENIED}：需要角色 ${roles.join("/")}，当前角色 ${role}`
    });
    return;
  }
  next();
};
