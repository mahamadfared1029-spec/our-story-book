"use server";

import { cookies } from "next/headers";
import { Locale, SUPPORTED_LOCALES, LOCALE_COOKIE_NAME } from "@/lib/i18n/types";

export async function setLocaleAction(newLocale: Locale) {
  if (!(newLocale in SUPPORTED_LOCALES)) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, newLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
