export function getPostLoginRedirectPath(role?: string | null) {
  if (role === "TEACHER" || role === "ADMIN") return "/teacher";
  if (role === "STUDENT") return "/profile";
  return "/";
}
