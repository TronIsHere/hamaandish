import { getSessionUser, type SessionUser } from "@/app/lib/auth/session";

/** Comma-separated list in ADMIN_EMAILS; compared case-insensitively to session email */
export function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const admins = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

/** Signed-in user whose email appears in ADMIN_EMAILS (typically also has an approved account). */
export async function getAdminSession(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
