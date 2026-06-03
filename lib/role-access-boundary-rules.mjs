const ROLE_HOME_PATH = {
  STUDENT: '/profile',
  TEACHER: '/teacher',
  ADMIN: '/admin',
};

const WORKSPACE_REQUIRED_ROLE = {
  '/profile': 'STUDENT',
  '/teacher': 'TEACHER',
  '/admin': 'ADMIN',
};

const WORKSPACE_NAV = {
  STUDENT: [{ label: '个人中心', href: '/profile' }],
  TEACHER: [{ label: '老师工作台', href: '/teacher' }],
  ADMIN: [{ label: '管理员后台', href: '/admin' }],
};

export function normalizeRole(role) {
  return typeof role === 'string' ? role.toUpperCase() : '';
}

export function getRoleHomePath(role) {
  return ROLE_HOME_PATH[normalizeRole(role)] || '/login';
}

export function getPersonalCenterHrefForRole(role) {
  return getRoleHomePath(role);
}

export function getVisibleWorkspaceNavForRole(role) {
  return WORKSPACE_NAV[normalizeRole(role)] || [];
}

export function getRequiredRoleForWorkspacePath(pathname) {
  if (!pathname) return null;
  const normalized = pathname.replace(/\/$/, '') || '/';
  for (const [prefix, role] of Object.entries(WORKSPACE_REQUIRED_ROLE)) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

export function canAccessWorkspacePath(role, pathname) {
  const requiredRole = getRequiredRoleForWorkspacePath(pathname);
  if (!requiredRole) return true;
  return normalizeRole(role) === requiredRole;
}

export function canAccessTeacherOperationApi(role) {
  return normalizeRole(role) === 'TEACHER';
}

export function canAccessAdminOperationApi(role) {
  return normalizeRole(role) === 'ADMIN';
}
