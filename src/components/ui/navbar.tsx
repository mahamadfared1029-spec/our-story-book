import Link from "next/link";
import { BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { getCurrentUser, signOutAction } from "@/actions/auth";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n/server";

export async function Navbar() {
  const authData = await getCurrentUser();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <header className="border-b border-[#EBE3DA] bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#2D2321] hover:text-[#7C2D37] transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-[#F2DDD9] flex items-center justify-center text-[#7C2D37] shadow-xs group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-[#2D2321]">
              {dict.common.appName}
            </span>
            <span className="text-[11px] text-[#7A6C68] font-medium tracking-wider">
              {locale === "ku" ? "كتاب قصتنا" : locale === "en" ? "Our Story Book" : "کتێبی چیرۆکمان"}
            </span>
          </div>
        </Link>

        {/* User Navigation & Language Switcher */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {authData ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4EFEB] text-[#2D2321] text-xs font-medium border border-[#EBE3DA]">
                <UserIcon className="w-3.5 h-3.5 text-[#7C2D37]" />
                <span>{authData.profile.display_name}</span>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7A6C68] hover:text-[#7C2D37] hover:bg-[#F2DDD9]/40 transition-colors"
                  title={dict.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{dict.common.logout}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#7C2D37] hover:bg-[#F2DDD9]/40 transition-colors"
              >
                {dict.common.login}
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#7C2D37] text-white hover:bg-[#67222B] shadow-xs transition-colors"
              >
                {dict.common.signup}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
