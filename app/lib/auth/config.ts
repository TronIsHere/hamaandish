export const SESSION_COOKIE_NAME = "hama_session";

/** Session lifetime in seconds (7 days). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAuthSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-only-secret-min-32-chars-rotate-me!!"
      : "");

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be at least 32 characters. Set it in .env.local for production.",
    );
  }

  return new TextEncoder().encode(secret);
}
