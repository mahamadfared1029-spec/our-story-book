"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { SUPPORTED_LOCALES, Locale } from "@/lib/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = SUPPORTED_LOCALES[locale];

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#F6EFEB] hover:bg-[#EFE5DF] text-[#6B2D38] border border-[#E8DDD5] transition-all shadow-xs"
        aria-label="تغيير اللغة / زمان / Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#B87A84]" />
        <span>{currentConfig.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-36 rounded-2xl bg-[#FFFDFB] border border-[#EAE0D6] shadow-lg py-1.5 z-50">
          {(Object.keys(SUPPORTED_LOCALES) as Locale[]).map((loc) => {
            const item = SUPPORTED_LOCALES[loc];
            const isSelected = locale === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-start transition-colors ${
                  isSelected
                    ? "bg-[#F7EFEA] text-[#6B2D38] font-bold"
                    : "text-[#54433F] hover:bg-[#FAF4F0]"
                }`}
              >
                <span>{item.nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#6B2D38]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
