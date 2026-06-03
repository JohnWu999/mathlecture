import { getWorkspaceForRole } from './admin-teacher-workspace-rules.mjs';

export function getPostLoginRedirectPath(role) {
  return getWorkspaceForRole(role).path;
}
