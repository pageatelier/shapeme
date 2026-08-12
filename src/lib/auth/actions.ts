"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// GoTrue's admin listUsers() has no email filter (only page/perPage), so a
// lookup means paging through users and matching client-side. Fine at
// SILUA's current scale; capped at a few thousand users so a typo'd email
// (or a much bigger future user base) can't turn one keystroke into an
// unbounded scan — past the cap this just falls through to "not found",
// which only costs a wrong branch in the UI (new-account copy shown to an
// existing user), never a security issue.
const MAX_PAGES = 20;
const PER_PAGE = 200;

/**
 * Whether `email` already has an account — drives LoginForm's branch
 * between "Welcome back" (password + log in) and "Create your account"
 * (password + continue) after the single email-entry step, without ever
 * showing the user an explicit log-in-vs-sign-up choice.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const admin = createAdminClient();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw new Error(error.message);

    if (data.users.some((u) => u.email?.toLowerCase() === normalized)) return true;
    if (data.users.length < PER_PAGE) return false; // last page
  }

  return false;
}
