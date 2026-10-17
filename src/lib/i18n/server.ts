import { cookies } from "next/headers";
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "./types";

export async function getCurrentLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale;
    if (cookie && cookie in SUPPORTED_LOCALES) {
      return cookie;
    }
  } catch {
    // Fallback if called outside request context
  }
  return DEFAULT_LOCALE;
}
