"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FDEDEC] text-[#922B21] flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-[#2D2321] mb-2">
        حدث خطأ غير متوقع
      </h1>
      <p className="text-xs sm:text-sm text-[#7A6C68] max-w-sm mx-auto mb-6 leading-relaxed">
        نعتذر، حدثت مشكلة غير متوقعة أثناء معالجة طلبك. بياناتك في أمان تام.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-white border border-[#EBE3DA] text-[#2D2321] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
        >
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
