import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ROLES } from "../constants/roles";

export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  if (roles.length === 0) return next();
  const role = (req as unknown as { user?: { role?: string } }).user?.role ?? ROLES.VISITOR;
  if (role === ROLES.ADMIN || roles.includes(role)) return next();
  return res.status(403).json({ code: ERROR_CODES.RBAC_DENIED, message: ERROR_MESSAGES.RBAC_DENIED });
};
