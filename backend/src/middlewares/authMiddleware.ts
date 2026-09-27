import type { RequestHandler } from "express";
import { UserRole } from "../constants/UserRole";

// 演示环境：身份由请求头携带（x-user-id / x-role），默认修复师。
export const authMiddleware: RequestHandler = (req, _res, next) => {
  (req as any).user = {
    id: Number(req.header("x-user-id")) || 1,
    role: req.header("x-role") ?? UserRole.RESTORER
  };
  next();
};
