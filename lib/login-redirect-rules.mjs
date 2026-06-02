export function getPostLoginRedirectPath(role) {
  if (role === 'TEACHER' || role === 'ADMIN') return '/teacher';
  if (role === 'STUDENT') return '/profile';
  return '/';
}
