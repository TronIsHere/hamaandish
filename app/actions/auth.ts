"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth/config";

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
