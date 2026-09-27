export const ROLES = ["restorer", "expert", "archivist", "visitor"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_TEXT: Record<Role, string> = {
  restorer: "修复师",
  expert: "专家",
  archivist: "档案员",
  visitor: "访客"
};
export const ROLE_USER_ID: Record<Role, number> = {
  restorer: 2,
  expert: 3,
  archivist: 4,
  visitor: 5
};
