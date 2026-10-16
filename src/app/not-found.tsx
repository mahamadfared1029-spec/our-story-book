import Link from "next/link";
import { BookX, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mb-4">
        <BookX className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#2D2321] mb-2">
        الصفحة أو الكتاب غير موجود
      </h1>
      <p className="text-xs sm:text-sm text-[#7A6C68] max-w-sm mx-auto mb-6 leading-relaxed">
        قد يكون الرابط غير صحيح، أو أنك لا تملك صلاحية الوصول إلى هذا المحتوى المحمي.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للرئيسية</span>
      </Link>
    </div>
  );
}
