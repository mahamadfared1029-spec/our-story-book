"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Heart, Lock, Mail, ArrowRight } from "lucide-react";
import { signInAction, type AuthState } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/context";

const initialState: AuthState = {
  error: null,
  success: null,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const { dict, locale } = useTranslation();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#EBE3DA] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-3">
            <Heart className="w-6 h-6 fill-[#7C2D37]/20" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight">
            {dict.auth.loginTitle}
          </h1>
          <p className="text-sm text-[#7A6C68] mt-1.5">
            {dict.auth.loginSubtitle}
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              {dict.auth.emailLabel}
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={dict.auth.emailPlaceholder}
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
              <Mail className="w-4 h-4 text-[#7A6C68] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              {dict.auth.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
              <Lock className="w-4 h-4 text-[#7A6C68] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{isPending ? dict.common.loading : dict.common.login}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#EBE3DA] text-center text-xs text-[#7A6C68]">
          {dict.auth.noAccount}{" "}
          <Link
            href="/signup"
            className="text-[#7C2D37] font-bold hover:underline inline-flex items-center gap-1"
          >
            {dict.common.signup}
            <ArrowRight className={`w-3 h-3 ${locale === "en" ? "" : "rotate-180"}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}
