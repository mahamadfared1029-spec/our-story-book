"use client";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import { acceptPartnerInviteAction } from "@/actions/invites";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default function InviteAcceptPage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const res = await acceptPartnerInviteAction(resolvedParams.code);
      if (res.success && res.bookId) {
        router.push(`/book/${res.bookId}`);
      } else {
        setError(res.error || "تعذر قبول الدعوة. يرجى التحقق من صحة الرابط.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#EBE3DA] p-6 sm:p-8 relative overflow-hidden text-center">
          {/* Subtle top bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-4">
            <Heart className="w-7 h-7 fill-[#7C2D37]/30" />
          </div>

          <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight mb-2">
            دعوة للانضمام إلى القصة
          </h1>

          <p className="text-sm text-[#7A6C68] leading-relaxed mb-6">
            لقد تلقيت دعوة خاصة من شريكك لمشاركته كتابة وتوثيق فصول ذكرياتكما معًا في مساحتكما الخاصة والآمنة.
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium text-start leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{isPending ? "جارٍ الانضمام..." : "قبول الدعوة والانضمام للقصة"}</span>
            </button>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[11px] text-[#7A6C68] text-start flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7C2D37] shrink-0 mt-0.5" />
              <span>
                تنبيه: إذا لم تكن قد سجلت الدخول بعد، يرجى{" "}
                <Link
                  href={`/login?returnUrl=/invite/${resolvedParams.code}`}
                  className="text-[#7C2D37] font-bold hover:underline"
                >
                  تسجيل الدخول
                </Link>{" "}
                أو{" "}
                <Link
                  href={`/signup?returnUrl=/invite/${resolvedParams.code}`}
                  className="text-[#7C2D37] font-bold hover:underline"
                >
                  إنشاء حساب جديد
                </Link>{" "}
                أولاً لتتمكن من الانضمام.
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EBE3DA] text-center">
            <Link
              href="/"
              className="text-xs text-[#7A6C68] hover:text-[#7C2D37] inline-flex items-center gap-1 font-medium"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الذهاب إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
