"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookPlus, Heart, ArrowRight, Sparkles } from "lucide-react";
import { createBookAction, type BookActionState } from "@/actions/books";

const initialState: BookActionState = {
  error: null,
  success: false,
};

export default function CreateBookPage() {
  const [state, formAction, isPending] = useActionState(createBookAction, initialState);

  // Today's date as max for story_start_date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top bar with back button */}
      <header className="border-b border-[#EBE3DA] bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى الرئيسية</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-[#2D2321]">
            <BookPlus className="w-4 h-4 text-[#7C2D37]" />
            <span>بدء كتاب جديد</span>
          </div>
          <div className="w-16" /> {/* Balance layout */}
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBE3DA] p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle top bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight">
              كتاب قصتكما الجديدة
            </h1>
            <p className="text-sm text-[#7A6C68] mt-1.5 leading-relaxed">
              املآ التفاصيل الأساسية لكتابكما. ستتمكنان من دعوة الشريك وإضافة الذكريات بعد الحفظ.
            </p>
          </div>

          {state?.error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium leading-relaxed">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-[#2D2321] mb-1.5"
              >
                عنوان الكتاب أو القصة
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={100}
                placeholder="مثال: حكايتنا معًا، أو فصول العمر"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
              <p className="text-[11px] text-[#7A6C68] mt-1">
                اختر عنوانًا يعبر عنكما وله مكانة خاصة في قلبيكما
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="partner1_name"
                  className="block text-xs font-semibold text-[#2D2321] mb-1.5"
                >
                  اسم الشريك الأول
                </label>
                <div className="relative">
                  <input
                    id="partner1_name"
                    name="partner1_name"
                    type="text"
                    required
                    maxLength={50}
                    placeholder="مثال: يوسف"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="partner2_name"
                  className="block text-xs font-semibold text-[#2D2321] mb-1.5"
                >
                  اسم الشريك الثاني
                </label>
                <div className="relative">
                  <input
                    id="partner2_name"
                    name="partner2_name"
                    type="text"
                    required
                    maxLength={50}
                    placeholder="مثال: مريم"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="story_start_date"
                className="block text-xs font-semibold text-[#2D2321] mb-1.5"
              >
                تاريخ بداية القصة (أول لقاء أو ذكرى خاصة)
              </label>
              <div className="relative">
                <input
                  id="story_start_date"
                  name="story_start_date"
                  type="date"
                  required
                  max={today}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
                />
              </div>
              <p className="text-[11px] text-[#7A6C68] mt-1">
                سيُستخدم هذا التاريخ لحساب أيام رحلتكما المشتركة
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 fill-white/20" />
                )}
                <span>{isPending ? "جارٍ حفظ الكتاب..." : "إنشاء الكتاب وحفظ الذكريات"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
