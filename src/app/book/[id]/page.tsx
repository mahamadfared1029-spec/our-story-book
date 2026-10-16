import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Heart, Sparkles, BookOpen } from "lucide-react";
import { getBookDetails } from "@/actions/books";
import { getCurrentUser } from "@/actions/auth";
import { Navbar } from "@/components/ui/navbar";
import { InviteManager } from "@/components/books/invite-manager";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}`);
  }

  const book = await getBookDetails(id);

  if (!book) {
    notFound();
  }

  // Calculate days since story start date
  const startDate = new Date(book.story_start_date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Formatted date in Arabic locale
  const formattedDate = startDate.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للكتب</span>
          </Link>
        </div>

        {/* Book Header Card */}
        <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-[#7C2D37]/30" />
                <span>{book.partner1_name} &amp; {book.partner2_name}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2321] tracking-tight">
                {book.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A6C68] pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7C2D37]" />
                  <span>بداية القصة: {formattedDate}</span>
                </div>
                <span>•</span>
                <div className="font-medium text-[#7C2D37]">
                  {diffDays} يومًا من الذكريات الجميلة
                </div>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#F4EFEB] border border-[#EBE3DA] flex items-center justify-center text-[#7C2D37] shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Grid: Members & Invite Manager */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content: Chapters Placeholder (Phase 2 teaser) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#EBE3DA] p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#2D2321] mb-2">
                فصول الذكريات والصور
              </h2>
              <p className="text-xs text-[#7A6C68] max-w-md mx-auto leading-relaxed mb-4">
                هنا ستتمكنان معًا من كتابة فصول قصتكما وإضافة الصور والتواريخ الخاصة بكل ذكرى.
                هذه الميزة تأتي في <span className="font-semibold text-[#7C2D37]">المرحلة الثانية</span> بعد إتمام فحص وتأكيد المرحلة الأولى.
              </p>
              <div className="inline-block px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#EBE3DA] text-[11px] text-[#7A6C68]">
                حالة المرحلة الأولى: قاعدة البيانات، المصادقة، والكتب والدعوات جاهزة بنجاح ✓
              </div>
            </div>
          </div>

          {/* Sidebar: Invite & Members Manager */}
          <div className="md:col-span-1">
            <InviteManager book={book} currentUserId={authData.user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
