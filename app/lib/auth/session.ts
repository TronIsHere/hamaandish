import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { isUserAccountApproved } from "@/app/lib/auth/users";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getAuthSecretKey,
} from "./config";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecretKey());
}

async function decodeSessionJwt(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    const id = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : null;
    if (!id || !email || !name) return null;
    return { id, email, name };
  } catch {
    return null;
  }
}

/** Valid JWT and Mongo user exists with approved account status. Pending users behave as logged out. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jwtUser = await decodeSessionJwt();
  if (!jwtUser) return null;
  try {
    const ok = await isUserAccountApproved(jwtUser.id);
    if (!ok) return null;
    return jwtUser;
  } catch {
    return null;
  }
}
