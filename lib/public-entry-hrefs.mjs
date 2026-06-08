export const DEPLOY_BASE_PATH = "/math-young-lecturer";

export const PUBLIC_PROFILE_HREF = `${DEPLOY_BASE_PATH}/profile`;

export function getPublicEntryHref(pathname) {
  if (!pathname || pathname === "/") return DEPLOY_BASE_PATH;
  if (pathname.startsWith(DEPLOY_BASE_PATH)) return pathname;
  return `${DEPLOY_BASE_PATH}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
