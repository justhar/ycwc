import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: any) {
  const { pathname } = request.nextUrl;

  // Skip middleware for paths that should not be internationalized
  if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all paths except static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
