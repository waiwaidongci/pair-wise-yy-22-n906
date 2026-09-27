export const UserRole = {
  RESTORER: "RESTORER",
  EXPERT: "EXPERT",
  ARCHIVIST: "ARCHIVIST",
  VISITOR: "VISITOR"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleText: Record<UserRole, string> = {
  RESTORER: "修复师",
  EXPERT: "专家审批",
  ARCHIVIST: "档案员",
  VISITOR: "访客"
};
