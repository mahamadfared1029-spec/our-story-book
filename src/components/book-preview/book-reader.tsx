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
import type { Book, ChapterWithDetails } from "@/lib/types/database";
import { MILESTONE_TYPES, MOOD_TAGS } from "@/lib/types/database";
import { formatArabicDate, calculateStoryStats } from "@/lib/timeline";

interface BookReaderProps {
  book: Book;
  chapters: ChapterWithDetails[];
}

export function BookReader({ book, chapters }: BookReaderProps) {
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
  const formattedStartDate = new Date(book.story_start_date).toLocaleDateString(
    "ar-EG",
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

  // Keyboard navigation (ArrowRight / ArrowLeft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // RTL: ArrowLeft moves forward (next page), ArrowRight moves backward (prev page)
      if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.name,
          text: `كتاب ذكرياتنا المشتركة — ${book.name}`,
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
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للكتاب</span>
          </Link>

          <span className="hidden sm:inline-block text-xs font-bold text-[#7C2D37]">
            {book.name}
          </span>
        </div>

        {/* Page progress & Actions */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#7A6C68] font-sans">
            صفحة {currentPage + 1} من {totalPages}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl text-xs font-medium hover:bg-black/5 transition-colors text-[#7A6C68]"
            title="مشاركة الرابط"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-xs font-medium hover:bg-black/5 transition-colors text-[#7A6C68]"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "وضع ملء الشاشة"}
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
          {/* Subtle Book Spine Texture on right in RTL */}
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

                  <p className="text-xs text-[#7A6C68]">كتاب الذكريات المشتركة</p>
                </div>

                <div className="my-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#7C2D37] text-white flex items-center justify-center mx-auto shadow-md">
                    <Heart className="w-8 h-8 fill-white/80" />
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2D2321] tracking-tight">
                    {book.name}
                  </h1>

                  <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#7C2D37] to-transparent mx-auto" />

                  <p className="text-xs sm:text-sm text-[#7A6C68] max-w-md mx-auto leading-relaxed">
                    «كل قصة حب هي حكاية خاصة.. وهذه حكايتنا التي خططنا تفاصيلها معًا
                    يومًا بعد يوم.»
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#7A6C68] pt-4">
                  <div>بدأت القصة في: {formattedStartDate}</div>
                  <div className="font-semibold text-[#7C2D37]">
                    {stats.formattedDuration} من الوفاء والذكريات
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
                  إهداء من القلب
                </h2>

                <blockquote className="text-sm sm:text-base text-[#4A3E3D] italic leading-loose max-w-lg mx-auto mb-8 font-serif">
                  «إلى شريك العمر ورفيق الدرب..
                  <br />
                  إلى اللحظات التي رسمت على وجوهنا أول ابتسامة،
                  <br />
                  وإلى كل خطوة مشيناها سوياً في دروب الحياة.
                  <br />
                  هذا الكتاب صُنع ليحفظ ما عجزت الكلمات العابرة عن حفظه..
                  <br />
                  لكل ذكرى جمعتنا، ولكل الغد الذي ينتظرنا معًا.»
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
                    <span>فهرس فصول القصة</span>
                  </h2>
                  <p className="text-xs text-[#7A6C68] mt-1">
                    {sortedChapters.length} فصول موثقة حسب التسلسل الزمني
                  </p>
                </div>

                {sortedChapters.length === 0 ? (
                  <p className="text-center text-xs text-[#7A6C68] py-12">
                    لم تتم إضافة فصول إلى الكتاب بعد.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sortedChapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setCurrentPage(3 + idx)}
                        className="p-3 rounded-2xl bg-white border border-[#EBE3DA] hover:border-[#7C2D37] text-start transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div className="space-y-0.5 truncate ps-2">
                          <div className="text-xs font-bold text-[#2D2321] group-hover:text-[#7C2D37] transition-colors truncate">
                            {idx + 1}. {ch.title}
                          </div>
                          <div className="text-[10px] text-[#7A6C68]">
                            {new Date(ch.event_date).toLocaleDateString("ar-EG")}
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-[#7C2D37] font-sans px-2">
                          ص {4 + idx}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAGES 3 to (3 + N - 1): CHAPTERS */}
            {currentPage >= 3 && currentPage < 3 + sortedChapters.length && (
              (() => {
                const chapterIndex = currentPage - 3;
                const chapter = sortedChapters[chapterIndex];
                const milestoneInfo = chapter.milestone_type
                  ? MILESTONE_TYPES[chapter.milestone_type as keyof typeof MILESTONE_TYPES]
                  : null;
                const moodInfo = chapter.mood_tag
                  ? MOOD_TAGS[chapter.mood_tag as keyof typeof MOOD_TAGS]
                  : null;

                return (
                  <div className="space-y-6">
                    {/* Chapter Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EBE3DA]">
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-[#7C2D37]">
                          الفصل {chapterIndex + 1}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2321]">
                          {chapter.title}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {chapter.is_milestone && milestoneInfo && (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${milestoneInfo.badgeClass}`}
                          >
                            <span>★</span>
                            <span>{milestoneInfo.label}</span>
                          </span>
                        )}

                        {moodInfo && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${moodInfo.colorClass}`}
                          >
                            <span>{moodInfo.emoji}</span>
                            <span>{moodInfo.label}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A6C68]">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7C2D37]" />
                        <span>{formatArabicDate(chapter.event_date)}</span>
                      </div>

                      {chapter.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#7C2D37]" />
                          <span>{chapter.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Chapter Body */}
                    <div className="text-xs sm:text-sm text-[#2D2321] leading-relaxed whitespace-pre-line font-normal">
                      {chapter.body}
                    </div>

                    {/* Chapter Images Gallery */}
                    {chapter.images && chapter.images.length > 0 && (
                      <div
                        className={`grid gap-4 pt-4 border-t border-[#EBE3DA] ${
                          chapter.images.length === 1
                            ? "grid-cols-1 max-w-md mx-auto"
                            : chapter.images.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}
                      >
                        {chapter.images.map((img, i) =>
                          img.signedUrl ? (
                            <div
                              key={img.id}
                              className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#EBE3DA] bg-white shadow-2xs"
                            >
                              <Image
                                src={img.signedUrl}
                                alt={`صورة ${i + 1} من ${chapter.title}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                              />
                            </div>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Author Signature */}
                    <div className="pt-4 text-start text-[11px] text-[#7A6C68] italic border-t border-[#EBE3DA]/40">
                      كتبها:{" "}
                      <span className="font-semibold text-[#2D2321]">
                        {chapter.authorProfile?.display_name || "الشريك"}
                      </span>
                    </div>
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
                  والقصة مستمرة معكما..
                </h3>

                <p className="text-xs sm:text-sm text-[#7A6C68] max-w-md mx-auto leading-relaxed">
                  هذه الصفحات ليست سوى بداية حكايتكما المشتركة. كل يوم جديد يحمل في
                  طياته تفاصيل تستحق التدوين والاحتفاء.
                </p>

                <div className="pt-6">
                  <Link
                    href={`/book/${book.id}/chapters/new`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
                  >
                    <span>إضافة فصل جديد للكتاب</span>
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
                ? "الغلاف"
                : currentPage === 1
                ? "الإهداء"
                : currentPage === 2
                ? "الفهرس"
                : currentPage === totalPages - 1
                ? "الخاتمة"
                : `ص ${currentPage + 1}`}
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
            <ChevronRight className="w-4 h-4" />
            <span>الصفحة السابقة</span>
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
                title={`انتقال للصفحة ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBE3DA] text-[#2D2321] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
          >
            <span>الصفحة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Copied toast */}
      {isCopied && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-[#2D2321] text-white text-xs px-4 py-2 rounded-xl shadow-lg z-50">
          تم نسخ رابط الكتاب للمشاركة!
        </div>
      )}
    </div>
  );
}
