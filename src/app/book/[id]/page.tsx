import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Heart,
  Plus,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getBookDetails } from "@/actions/books";
import { getBookChaptersWithImages } from "@/actions/chapters";
import { getCurrentUser } from "@/actions/auth";
import { Navbar } from "@/components/ui/navbar";
import { InviteManager } from "@/components/books/invite-manager";
import { ChapterCard } from "@/components/chapters/chapter-card";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}`);
  }

  const [book, chapters] = await Promise.all([
    getBookDetails(id),
    getBookChaptersWithImages(id),
  ]);

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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للكتب</span>
          </Link>

          <Link
            href={`/book/${book.id}/chapters/new`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فصل جديد</span>
          </Link>
        </div>

        {/* Book Header Card */}
        <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-[#7C2D37]/30" />
                <span>
                  {book.partner1_name} &amp; {book.partner2_name}
                </span>
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
                <span>•</span>
                <div className="font-medium text-[#2D2321]">
                  {chapters.length} {chapters.length === 1 ? "فصل" : "فصول"}
                </div>
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#F4EFEB] border border-[#EBE3DA] flex items-center justify-center text-[#7C2D37] shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Grid: Chapters List & Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column: Chapters Feed */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2D2321] flex items-center gap-2">
                <span>فصول الذكريات</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] font-semibold">
                  {chapters.length}
                </span>
              </h2>

              {chapters.length > 0 && (
                <Link
                  href={`/book/${book.id}/chapters/new`}
                  className="text-xs text-[#7C2D37] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فصل</span>
                </Link>
              )}
            </div>

            {chapters.length === 0 ? (
              /* Empty Chapters State */
              <div className="bg-white rounded-3xl border border-[#EBE3DA] p-10 sm:p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF0EE] text-[#7C2D37] mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#2D2321] mb-2">
                  الصفحة الأولى تنتظر كلماتكما
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6C68] max-w-md mx-auto leading-relaxed mb-6">
                  لم تقوما بتوثيق أي فصل في هذا الكتاب بعد. ابدآ الآن بتدوين أول لقاء أو ذكرى مميزة بينكما مع إضافة الصور المفضلة!
                </p>
                <Link
                  href={`/book/${book.id}/chapters/new`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>كتابة أول فصل الآن</span>
                </Link>
              </div>
            ) : (
              /* Chronological Chapters List */
              <div className="space-y-6">
                {chapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    bookId={book.id}
                    currentUserId={authData.user.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Invite & Members Manager */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <InviteManager book={book} currentUserId={authData.user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
