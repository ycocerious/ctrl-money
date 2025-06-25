import { type NextRequest } from "next/server";
import { updateSession } from "~/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next|manifest\\.json|sw\\.js|workbox-.*\\.js|icon-.*|favicon\\.ico|privacy|terms|landing|[^?]*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2)).*)",
    "/(api|trpc)(.*)",
  ],
};
