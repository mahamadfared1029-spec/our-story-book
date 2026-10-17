"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  Bookmark,
  Share2,
} from "lucide-react";
import {
  MILESTONE_TYPES,
  MOOD_TAGS,
  type MilestoneType,
  type MoodTag,
  type Book,
  type ChapterWithDetails,
  type ChapterImageWithUrl,
} from "@/lib/types/database";
import { formatArabicDate, calculateStoryStats } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface BookReaderProps {
  book: Book;
  chapters: ChapterWithDetails[];
}

export function BookReader({ book, chapters }: BookReaderProps) {
  const { dict, locale } = useTranslation();

  // Sort chapters chronologically for book reading
  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Total pages: Cover (0) + Dedication (1) + Table of Contents (2) + Chapters (N) + Epilogue (1)
  const totalPages = 3 + sortedChapters.length + 1;

  const stats = calculateStoryStats(book.story_start_date, sortedChapters);
  const dateLocale = locale === "en" ? "en-US" : locale === "ku" ? "ckb" : "ar-EG";
  const formattedStartDate = new Date(book.story_start_date).toLocaleDateString(
    dateLocale,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (locale === "en") {
          setCurrentPage((prev) => Math.max(prev - 1, 0));
        } else {
          setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
        }
      } else if (e.key === "ArrowRight") {
        if (locale === "en") {
          setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
        } else {
          setCurrentPage((prev) => Math.max(prev - 1, 0));
        }
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages, isFullscreen, locale]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.name,
          text: `${dict.reader.coverTitle} — ${book.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#251E1D] text-[#FAF7F2]"
          : "bg-[#F5EFEB] text-[#2D2321]"
      }`}
    >
      {/* Top Reader Controls */}
      <header
        className={`px-4 sm:px-8 py-4 flex items-center justify-between border-b backdrop-blur-md transition-all ${
          isFullscreen
            ? "border-[#4A3E3D] bg-[#251E1D]/90"
            : "border-[#EBE3DA] bg-white/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/book/${book.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:bg-black/5"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${locale === "en" ? "rotate-180" : ""}`} />
            <span>{dict.print.backToBook}</span>
          </Link>

          <span className="hidden sm:inline-block text-xs font-bold text-[#7C2D37]">
            {book.name}
          </span>
        </div>

        {/* Page progress, LanguageSwitcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <span className="text-xs font-medium text-[#7A6C68] font-sans">
            {dict.reader.page} {currentPage + 1} {dict.reader.of} {totalPages}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl text-xs font-medium hover:bg-black/5 transition-colors text-[#7A6C68]"
            title={dict.reader.shareLink}
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-xs font-medium hover:bg-black/5 transition-colors text-[#7A6C68]"
            title={isFullscreen ? dict.reader.exitFullscreen : dict.reader.fullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* Book Container with Spine & Shadows */}
        <div className="relative w-full aspect-1/1 sm:aspect-16/11 max-h-[80vh] bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E0D7CC] flex flex-col overflow-hidden text-[#2D2321] select-none">
          {/* Subtle Book Spine Texture */}
          <div className="absolute top-0 bottom-0 start-0 w-3 bg-gradient-to-r from-[#D48C84]/20 via-black/5 to-transparent pointer-events-none" />

          {/* Render Page Content based on currentPage */}
          <div className="flex-1 p-6 sm:p-12 overflow-y-auto">
            {/* PAGE 0: BOOK COVER */}
            {currentPage === 0 && (
              <div className="h-full flex flex-col items-center justify-between text-center py-6 sm:py-8 border-4 border-double border-[#D48C84]/40 rounded-2xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB]">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-semibold border border-[#E8C2BF]">
                    <Heart className="w-3.5 h-3.5 fill-[#7C2D37]/30" />
                    <span>
                      {book.partner1_name} &amp; {book.partner2_name}
                    </span>
                  </div>

                  <p className="text-xs text-[#7A6C68] tracking-widest uppercase">
                    {dict.reader.coverTitle}
                  </p>
                </div>

                <div className="my-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#7C2D37] text-white flex items-center justify-center mx-auto shadow-md">
                    <Heart className="w-8 h-8 fill-white/80" />
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2D2321] tracking-tight">
                    {book.name}
                  </h1>

                  <div className="w-24 h-0.5 bg-[#7C2D37] mx-auto rounded-full" />

                  <p className="text-xs sm:text-sm text-[#7A6C68] max-w-sm mx-auto leading-relaxed italic font-serif">
                    {locale === "ku"
                      ? "«هەموو چیرۆکێکی خۆشەویستی بەسەرهاتێکی تایبەتە.. ئەمەش چیرۆکی ئێمەیە کە ڕۆژ لە دوای ڕۆژ پێکەوە نووسیمانەوە.»"
                      : locale === "en"
                      ? "“Every love story is special.. and this is our journey, written together day by day.”"
                      : "«كل قصة حب هي حكاية خاصة.. وهذه حكايتنا التي خططنا تفاصيلها معًا يومًا بعد يوم.»"}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#7A6C68] pt-4">
                  <div>
                    {locale === "ku" ? `دەستپێکی چیرۆک: ${formattedStartDate}` : locale === "en" ? `Start date: ${formattedStartDate}` : `بدأت القصة في: ${formattedStartDate}`}
                  </div>
                  <div className="font-semibold text-[#7C2D37]">
                    {locale === "ku" ? `${stats.formattedDuration} لە وەفاداری و یادەوەری` : locale === "en" ? `${stats.formattedDuration} of loyalty & memories` : `${stats.formattedDuration} من الوفاء والذكريات`}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 1: DEDICATION */}
            {currentPage === 1 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 relative">
                <div className="w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#2D2321] mb-6">
                  {dict.reader.dedication}
                </h2>

                <blockquote className="text-sm sm:text-base text-[#4A3E3D] italic leading-loose max-w-lg mx-auto mb-8 font-serif">
                  «{dict.reader.dedicationText}»
                </blockquote>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#7C2D37]">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>
                    {book.partner1_name} &amp; {book.partner2_name}
                  </span>
                </div>
              </div>
            )}

            {/* PAGE 2: TABLE OF CONTENTS */}
            {currentPage === 2 && (
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-[#EBE3DA]">
                  <h2 className="text-2xl font-bold text-[#2D2321] flex items-center justify-center gap-2">
                    <Bookmark className="w-5 h-5 text-[#7C2D37]" />
                    <span>{dict.reader.contents}</span>
                  </h2>
                  <p className="text-xs text-[#7A6C68] mt-1">
                    {sortedChapters.length} {dict.common.chapters}
                  </p>
                </div>

                {sortedChapters.length === 0 ? (
                  <p className="text-center text-xs text-[#7A6C68] py-12">
                    {dict.home.emptyBooks}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortedChapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setCurrentPage(3 + idx)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF0EE]/60 transition-colors text-start group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-bold flex items-center justify-center font-sans">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-[#2D2321] group-hover:text-[#7C2D37] transition-colors">
                            {ch.title}
                          </span>
                          {ch.is_milestone && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF9E7] text-[#B7950B] text-[10px] font-semibold">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#7A6C68]">
                          <span className="hidden sm:inline font-sans">
                            {formatArabicDate(ch.event_date)}
                          </span>
                          <span className="font-semibold text-[#7C2D37] font-sans">
                            {dict.reader.page} {4 + idx}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGES 3 to N+2: CHAPTER SPREADS */}
            {currentPage >= 3 && currentPage < 3 + sortedChapters.length && (
              (() => {
                const chapterIndex = currentPage - 3;
                const chapter = sortedChapters[chapterIndex];
                const milestoneMeta = chapter.milestone_type
                  ? MILESTONE_TYPES[chapter.milestone_type as MilestoneType]
                  : null;
                const moodMeta = chapter.mood_tag
                  ? MOOD_TAGS[chapter.mood_tag as MoodTag]
                  : null;

                return (
                  <div className="space-y-6">
                    {/* Chapter Header */}
                    <div className="pb-4 border-b border-[#EBE3DA] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#7C2D37] uppercase tracking-wider">
                          {locale === "ku" ? `بەشی ${chapterIndex + 1}` : locale === "en" ? `Chapter ${chapterIndex + 1}` : `الفصل ${chapterIndex + 1}`}
                        </span>

                        <div className="flex items-center gap-2">
                          {milestoneMeta && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#B7950B] border border-[#F9E79F] text-xs font-semibold">
                              <span>★</span>
                              <span>{milestoneMeta.label}</span>
                            </span>
                          )}
                          {moodMeta && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-medium">
                              <span>{moodMeta.emoji}</span>
                              <span>{moodMeta.label}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2321]">
                        {chapter.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A6C68]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#7C2D37]" />
                          <span>{formatArabicDate(chapter.event_date)}</span>
                        </span>

                        {chapter.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#7C2D37]" />
                            <span>{chapter.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chapter Body Story Text */}
                    <div className="text-sm sm:text-base text-[#3A2D2A] leading-relaxed whitespace-pre-wrap font-serif">
                      {chapter.body}
                    </div>

                    {/* Chapter Photos */}
                    {chapter.images && chapter.images.length > 0 && (
                      <div className="pt-4 border-t border-[#EBE3DA]">
                        <div
                          className={`grid gap-3 ${
                            chapter.images.length === 1
                              ? "grid-cols-1"
                              : chapter.images.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-2 sm:grid-cols-3"
                          }`}
                        >
                          {chapter.images.map((img: ChapterImageWithUrl) =>
                            img.signedUrl ? (
                              <div
                                key={img.id}
                                className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#EBE3DA] shadow-xs bg-[#FAF7F2]"
                              >
                                <Image
                                  src={img.signedUrl}
                                  alt={chapter.title}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 400px"
                                  className="object-cover"
                                />
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            {/* FINAL PAGE: EPILOGUE */}
            {currentPage === totalPages - 1 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-7 h-7 fill-[#7C2D37]/30" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#2D2321]">
                  {dict.reader.epilogue}
                </h3>

                <p className="text-xs sm:text-sm text-[#7A6C68] max-w-md mx-auto leading-relaxed">
                  «{dict.reader.epilogueText}»
                </p>

                <div className="pt-6">
                  <Link
                    href={`/book/${book.id}/chapters/new`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
                  >
                    <span>{dict.chapter.newTitle}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Reader Page Indicator */}
          <div className="py-2.5 px-6 border-t border-[#EBE3DA]/60 bg-[#FAF7F2] flex items-center justify-between text-[11px] text-[#7A6C68]">
            <span>{book.name}</span>
            <span className="font-sans font-semibold">
              {currentPage === 0
                ? locale === "ku" ? "بەرگ" : locale === "en" ? "Cover" : "الغلاف"
                : currentPage === 1
                ? dict.reader.dedication
                : currentPage === 2
                ? dict.reader.contents
                : currentPage === totalPages - 1
                ? dict.reader.epilogue
                : `${dict.reader.page} ${currentPage + 1}`}
            </span>
          </div>
        </div>

        {/* Page Flip Navigation Buttons */}
        <div className="flex items-center justify-between w-full mt-6 px-4">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBE3DA] text-[#2D2321] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
          >
            <ChevronRight className={`w-4 h-4 ${locale === "en" ? "rotate-180" : ""}`} />
            <span>{dict.reader.prevPage}</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs scrollbar-none px-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentPage === idx
                    ? "w-6 bg-[#7C2D37]"
                    : "bg-[#EBE3DA] hover:bg-[#D48C84]"
                }`}
                title={`${dict.reader.page} ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBE3DA] text-[#2D2321] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
          >
            <span>{dict.reader.nextPage}</span>
            <ChevronLeft className={`w-4 h-4 ${locale === "en" ? "rotate-180" : ""}`} />
          </button>
        </div>
      </main>

      {/* Copied toast */}
      {isCopied && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-[#2D2321] text-white text-xs px-4 py-2 rounded-xl shadow-lg z-50">
          {dict.reader.linkCopied}
        </div>
      )}
    </div>
  );
}
