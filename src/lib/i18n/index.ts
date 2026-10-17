import { ar } from "./dictionaries/ar";
import { ku } from "./dictionaries/ku";
import { en } from "./dictionaries/en";
import { Locale, Dictionary, DEFAULT_LOCALE } from "./types";

export * from "./types";

const dictionaries: Record<Locale, Dictionary> = {
  ar,
  ku,
  en,
};

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}
