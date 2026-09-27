export const ROLES = { RESTORER: "restorer", EXPERT: "expert", ARCHIVIST: "archivist", VISITOR: "visitor", ADMIN: "admin" } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
