export const DEPLOY_BASE_PATH = "/math-young-lecturer";

export const LEGACY_ENTRY_PREFIXES = [
  "/login",
  "/register",
  "/teacher",
  "/admin",
  "/profile",
  "/qa",
  "/projects",
  "/hall",
  "/groups",
  "/api/auth",
];

export function shouldRedirectLegacyPath(pathname) {
  if (!pathname || pathname === "/") return false;
  if (pathname === DEPLOY_BASE_PATH || pathname.startsWith(`${DEPLOY_BASE_PATH}/`)) return false;
  return LEGACY_ENTRY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getLegacyPathRedirectTarget(pathWithOptionalQuery, options = {}) {
  const [pathname, query = ""] = pathWithOptionalQuery.split("?");
  if (options.requestBasePath === DEPLOY_BASE_PATH) return null;
  if (!shouldRedirectLegacyPath(pathname)) return null;
  return `${DEPLOY_BASE_PATH}${pathname}${query ? `?${query}` : ""}`;
}
