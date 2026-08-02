import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Renamed from `middleware` — Next.js 16 deprecated the `middleware.ts`
// convention in favor of `proxy.ts` (see AGENTS.md / next.js proxy docs).
export async function proxy(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return;
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
