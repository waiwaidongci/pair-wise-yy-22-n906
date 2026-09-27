export const UserRole = {
  RESTORER: "RESTORER",
  EXPERT: "EXPERT",
  ARCHIVIST: "ARCHIVIST",
  VISITOR: "VISITOR"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
