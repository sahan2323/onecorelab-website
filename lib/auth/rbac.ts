import type { SessionRole } from "./session";

/**
 * Central role hierarchy. Server actions and route handlers should call
 * requireRole()/can() rather than trusting anything from the client —
 * the UI hides buttons for convenience, but access is enforced here.
 */
const ROLE_RANK: Record<SessionRole, number> = {
  STAFF: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

export function hasAtLeastRole(role: SessionRole, minimum: SessionRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const permissions = {
  manageProjects: (role: SessionRole) => hasAtLeastRole(role, "STAFF"),
  publishProjects: (role: SessionRole) => hasAtLeastRole(role, "ADMIN"),
  manageFinancialRecords: (role: SessionRole) => hasAtLeastRole(role, "ADMIN"),
  viewFinancialRecords: (role: SessionRole) => hasAtLeastRole(role, "ADMIN"),
  manageStaff: (role: SessionRole) => hasAtLeastRole(role, "SUPER_ADMIN"),
  viewAnalytics: (role: SessionRole) => hasAtLeastRole(role, "ADMIN"),
  viewContactSubmissions: (role: SessionRole) => hasAtLeastRole(role, "STAFF"),
};
