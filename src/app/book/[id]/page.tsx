import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Sparkles,
  BookOpen,
  Printer,
  Settings,
} from "lucide-react";
import { getBookDetails } from "@/actions/books";
import { getBookChaptersWithImages } from "@/actions/chapters";
import { getCurrentUser } from "@/actions/auth";
import { Navbar } from "@/components/ui/navbar";
import { InviteManager } from "@/components/books/invite-manager";
import { StoryStatsCard } from "@/components/timeline/story-stats-card";
import { MemoryPromptsBar } from "@/components/timeline/memory-prompts-bar";
import { StoryTimeline } from "@/components/timeline/story-timeline";
import { getDictionary, SUPPORTED_LOCALES } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n/server";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const authData = await getCurrentUser();

  if (!authData) {
    redirect(`/login?returnUrl=/book/${id}`);
  }

  const [book, chapters, locale] = await Promise.all([
    getBookDetails(id),
    getBookChaptersWithImages(id),
    getCurrentLocale(),
  ]);

  if (!book) {
    notFound();
  }

  const dict = getDictionary(locale);
  const config = SUPPORTED_LOCALES[locale];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${config.dir === "ltr" ? "rotate-180" : ""}`} />
            <span>{dict.nav.myBooks}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/book/${book.id}/preview`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBE3DA] text-[#7C2D37] text-xs font-semibold hover:bg-[#FAF0EE] transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{dict.nav.previewBook}</span>
            </Link>

            <Link
              href={`/book/${book.id}/print`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBE3DA] text-[#7A6C68] hover:text-[#7C2D37] text-xs font-semibold hover:bg-[#FAF0EE] transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{dict.nav.printBook}</span>
            </Link>

            <Link
              href={`/book/${book.id}/settings`}
              className="p-2 rounded-xl bg-white border border-[#EBE3DA] text-[#7A6C68] hover:text-[#7C2D37] hover:bg-[#FAF0EE] transition-all shadow-2xs"
              title={dict.nav.settings}
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              href={`/book/${book.id}/chapters/new`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{dict.chapter.newTitle}</span>
            </Link>
          </div>
        </div>

        {/* Story Stats & Days Elapsed Header */}
        <StoryStatsCard book={book} chapters={chapters} />

        {/* Inspirational Memory Prompts Bar */}
        <MemoryPromptsBar bookId={book.id} />

        {/* Main Content Grid: Timeline & Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column: Interactive Timeline */}
          <div className="md:col-span-2">
            <StoryTimeline
              chapters={chapters}
              bookId={book.id}
              currentUserId={authData.user.id}
            />
          </div>

          {/* Sidebar: Invite & Members Manager */}
          <div className="md:col-span-1 space-y-6">
            <div className="sticky top-20 space-y-6">
              <InviteManager book={book} currentUserId={authData.user.id} />

              {/* Romantic Note Box */}
              <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 shadow-xs text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#FAF0EE] text-[#7C2D37] mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#2D2321]">
                  {locale === "ku" ? "نهێنی مانەوەی چیرۆکە جوانەکان" : locale === "en" ? "The Secret of Timeless Love Stories" : "سر استمرار الحكايات الجميلة"}
                </h4>
                <p className="text-[11px] text-[#7A6C68] leading-relaxed">
                  {locale === "ku" ? "«یادەوەرییە هاوبەشەکان گەنجینەیەکن کە هەرگیز کۆتایی نایەت.. هەموو وشە و وێنەیەک کە ئەمڕۆ تۆماری دەکەن، دەبێتە بەنرخترین دیاری کە دوای ساڵانێک پێکەوە دەیخوێننەوە.»" : locale === "en" ? "“Shared memories are an everlasting treasure.. every word and photo you capture today will become the most precious gift you read together years from now.”" : "«الذكريات المشتركة هي الكنز الذي لا ينفد.. كل كلمة وصورة توثقانها اليوم ستكون أغلى هدية تقرآنها معًا بعد سنوات.»"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
