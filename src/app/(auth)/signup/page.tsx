"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles, Lock, Mail, User, ArrowRight } from "lucide-react";
import { signUpAction, type AuthState } from "@/actions/auth";

const initialState: AuthState = {
  error: null,
  success: null,
};

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#EBE3DA] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight">
            ابدآ رحلتكما معًا
          </h1>
          <p className="text-sm text-[#7A6C68] mt-1.5">
            أنشئ حسابك لتوثيق كل لحظة جميلة في كتابكما الخاص
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#E8F8F5] border border-[#A3E4D7] text-[#117A65] text-xs font-medium leading-relaxed">
            {state.success}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              اسمك المعروض
            </label>
            <div className="relative">
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                placeholder="مثال: يوسف أو مريم"
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
              <User className="w-4 h-4 text-[#7A6C68] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#7A6C68] mt-1">
              هذا الاسم سيظهر لشريكك داخل الكتاب
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
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
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 ps-10 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
              <Lock className="w-4 h-4 text-[#7A6C68] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#7A6C68] mt-1">
              8 أحرف على الأقل لحماية خصوصيتكما
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none mt-3 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{isPending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب والبدء"}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#EBE3DA] text-center text-xs text-[#7A6C68]">
          لديكما حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="text-[#7C2D37] font-bold hover:underline inline-flex items-center gap-1"
          >
            تسجيل الدخول
            <ArrowRight className="w-3 h-3 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
