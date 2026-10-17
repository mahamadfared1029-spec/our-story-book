"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { Locale, Dictionary, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "./types";
import { ar } from "./dictionaries/ar";
import { ku } from "./dictionaries/ku";
import { en } from "./dictionaries/en";
import { setLocaleAction } from "@/actions/locale";

const dictionaries: Record<Locale, Dictionary> = {
  ar,
  ku,
  en,
};

interface LanguageContextType {
  locale: Locale;
  dict: Dictionary;
  setLocale: (newLocale: Locale) => Promise<void>;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  dict: dictionaries[DEFAULT_LOCALE],
  setLocale: async () => {},
  isPending: false,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function LanguageProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const savedLocale = getCookie(LOCALE_COOKIE_NAME) as Locale | null;
    if (savedLocale && savedLocale in SUPPORTED_LOCALES && savedLocale !== locale) {
      setLocaleState(savedLocale);
      const config = SUPPORTED_LOCALES[savedLocale];
      document.documentElement.lang = config.langCode;
      document.documentElement.dir = config.dir;
    }
  }, [locale]);

  const handleSetLocale = async (newLocale: Locale) => {
    if (newLocale === locale || !(newLocale in SUPPORTED_LOCALES)) return;
    setLocaleState(newLocale);
    const config = SUPPORTED_LOCALES[newLocale];
    document.documentElement.lang = config.langCode;
    document.documentElement.dir = config.dir;

    startTransition(async () => {
      await setLocaleAction(newLocale);
      window.location.reload();
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dict: dictionaries[locale] || dictionaries[DEFAULT_LOCALE],
        setLocale: handleSetLocale,
        isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
