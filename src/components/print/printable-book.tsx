"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Printer,
  ArrowRight,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import type { Book, ChapterWithDetails } from "@/lib/types/database";
import { MILESTONE_TYPES } from "@/lib/types/database";
import { formatArabicDate, calculateStoryStats } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface PrintableBookProps {
  book: Book;
  chapters: ChapterWithDetails[];
}

export function PrintableBook({ book, chapters }: PrintableBookProps) {
  const { dict, locale } = useTranslation();

  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0EAE1] text-[#2D2321] print:bg-white print:text-black">
      {/* Non-Printable Header Toolbar */}
      <aside className="print:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBE3DA] px-4 sm:px-8 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/book/${book.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] px-3 py-1.5 rounded-xl hover:bg-black/5 transition-colors"
            >
              <ArrowRight className={`w-3.5 h-3.5 ${locale === "en" ? "rotate-180" : ""}`} />
              <span>{dict.print.backToBook}</span>
            </Link>

            <span className="text-xs font-bold text-[#7C2D37]">
              {dict.print.toolbarTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{dict.print.printButton}</span>
            </button>
          </div>
        </div>

        {/* Helpful print tips notice */}
        <div className="max-w-4xl mx-auto mt-3 p-3 rounded-xl bg-[#FAF0EE] border border-[#E8C2BF] text-xs text-[#7C2D37] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>{dict.print.tipsTitle}</strong> {dict.print.tipGraphics} {dict.print.tipMargins}
          </p>
        </div>
      </aside>

      {/* Printable Book Pages Canvas */}
      <main className="max-w-[210mm] mx-auto my-8 print:my-0 shadow-xl print:shadow-none bg-white">
        {/* ================================================================== */}
        {/* PAGE 1: FRONT COVER */}
        {/* ================================================================== */}
        <section className="min-h-[297mm] p-[20mm] flex flex-col justify-between text-center relative overflow-hidden break-after-page bg-[#FAF7F2] border-[12px] border-double border-[#D48C84]/40 print:border-[#7C2D37]/30">
          <div className="pt-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-sm font-semibold border border-[#E8C2BF]">
              <Heart className="w-4 h-4 fill-[#7C2D37]/30" />
              <span>
                {book.partner1_name} &amp; {book.partner2_name}
              </span>
            </div>

            <p className="text-xs text-[#7A6C68] tracking-widest uppercase">
              {locale === "ku" ? "کتێبی یادەوەری و چیرۆکی هاوبەشمان" : locale === "en" ? "Book of Memories & Our Shared Story" : "كتاب الذكريات والقصة المشتركة"}
            </p>
          </div>

          <div className="my-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#7C2D37] text-white flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-10 h-10 fill-white/80" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2D2321] tracking-tight">
              {book.name}
            </h1>

            <div className="w-32 h-1 bg-[#7C2D37] mx-auto rounded-full" />

            <p className="text-sm text-[#7A6C68] max-w-md mx-auto leading-loose italic font-serif">
              {locale === "ku"
                ? "«هەموو چیرۆکێکی خۆشەویستی بەسەرهاتێکی تایبەتە.. ئەمەش حیکایەتی ئێمەیە کە وردەکارییەکانیمان پێکەوە ڕۆژ بە ڕۆژ نەخشاند.»"
                : locale === "en"
                ? "“Every love story is special.. and this is our journey, designed together day by day.”"
                : "«كل قصة حب هي حكاية خاصة.. وهذه حكايتنا التي خططنا تفاصيلها معًا يومًا بعد يوم.»"}
            </p>
          </div>

          <div className="pb-8 space-y-2 text-xs text-[#7A6C68] border-t border-[#EBE3DA] pt-6">
            <div>
              {locale === "ku" ? `بەرواری دەستپێک: ${formattedStartDate}` : locale === "en" ? `Start date: ${formattedStartDate}` : `تاريخ بداية القصة: ${formattedStartDate}`}
            </div>
            <div className="font-semibold text-[#7C2D37]">
              {locale === "ku"
                ? `${stats.formattedDuration} لە خۆشەویستی و وەفاداری`
                : locale === "en"
                ? `${stats.formattedDuration} of love & devotion`
                : `${stats.formattedDuration} من المحبة والوفاء`}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* PAGE 2: DEDICATION */}
        {/* ================================================================== */}
        <section className="min-h-[297mm] p-[25mm] flex flex-col justify-center text-center relative break-after-page bg-white">
          <div className="max-w-md mx-auto space-y-8 border-y-2 border-[#EBE3DA] py-16">
            <div className="w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold text-[#2D2321]">
              {dict.reader.dedication}
            </h2>

            <blockquote className="text-base text-[#4A3E3D] italic leading-loose font-serif">
              «{dict.reader.dedicationText}»
            </blockquote>

            <div className="text-sm font-bold text-[#7C2D37]">
              {book.partner1_name} &amp; {book.partner2_name}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* PAGE 3: TABLE OF CONTENTS */}
        {/* ================================================================== */}
        <section className="min-h-[297mm] p-[20mm] flex flex-col justify-start break-after-page bg-white">
          <div className="text-center pb-6 border-b-2 border-[#7C2D37]/30 mb-8">
            <h2 className="text-2xl font-bold text-[#2D2321]">{dict.reader.contents}</h2>
            <p className="text-xs text-[#7A6C68] mt-1">
              {locale === "ku" ? "ڕێکخستنی بەشەکان بەپێی کاتی ڕوودانیان" : locale === "en" ? "Chapters arranged chronologically" : "ترتيب الفصول حسب التسلسل الزمني للأحداث"}
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {sortedChapters.map((chapter, idx) => (
              <div
                key={chapter.id}
                className="flex items-center justify-between py-2 border-b border-dotted border-[#EBE3DA] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#7C2D37] w-6">{idx + 1}.</span>
                  <span className="font-semibold text-[#2D2321]">{chapter.title}</span>
                  {chapter.is_milestone && (
                    <span className="text-[10px] text-[#B9770E] font-medium bg-[#FEF9E7] px-2 py-0.5 rounded-full">
                      ★
                    </span>
                  )}
                </div>

                <div className="text-[#7A6C68] font-sans">
                  {new Date(chapter.event_date).toLocaleDateString(dateLocale)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-[#A89F91] pt-6 border-t border-[#EBE3DA]">
            {book.name} — {dict.reader.page} ٣
          </div>
        </section>

        {/* ================================================================== */}
        {/* CHAPTER PAGES */}
        {/* ================================================================== */}
        {sortedChapters.map((chapter, idx) => {
          const milestoneInfo = chapter.milestone_type
            ? MILESTONE_TYPES[chapter.milestone_type as keyof typeof MILESTONE_TYPES]
            : null;

          return (
            <section
              key={chapter.id}
              className="min-h-[297mm] p-[20mm] flex flex-col justify-between break-after-page bg-white"
            >
              <div className="space-y-6">
                {/* Chapter Title & Header */}
                <div className="pb-4 border-b border-[#EBE3DA] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#7C2D37]">
                      {locale === "ku" ? `بەشی ${idx + 1}` : locale === "en" ? `Chapter ${idx + 1}` : `الفصل ${idx + 1}`}
                    </span>
                    <h2 className="text-2xl font-bold text-[#2D2321] mt-1">
                      {chapter.title}
                    </h2>
                  </div>

                  {chapter.is_milestone && milestoneInfo && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF0EE] text-[#7C2D37] border border-[#E8C2BF]">
                      ★ {milestoneInfo.label}
                    </span>
                  )}
                </div>

                {/* Metadata Line */}
                <div className="flex items-center gap-4 text-xs text-[#7A6C68] font-medium">
                  <div className="flex items-center gap-1">
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
                <div className="text-sm text-[#2D2321] leading-loose whitespace-pre-line text-justify font-serif">
                  {chapter.body}
                </div>

                {/* Photos Spread (if any) */}
                {chapter.images && chapter.images.length > 0 && (
                  <div
                    className={`grid gap-4 pt-4 border-t border-[#EBE3DA] ${
                      chapter.images.length === 1
                        ? "grid-cols-1 max-w-lg mx-auto"
                        : chapter.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {chapter.images.map((img) =>
                      img.signedUrl ? (
                        <div
                          key={img.id}
                          className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#EBE3DA] bg-[#FAF7F2]"
                        >
                          <Image
                            src={img.signedUrl}
                            alt={chapter.title}
                            fill
                            sizes="500px"
                            className="object-cover"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              {/* Chapter Page Footer */}
              <div className="pt-6 border-t border-[#EBE3DA] flex items-center justify-between text-[11px] text-[#7A6C68]">
                <span>
                  {locale === "ku" ? "بە قەڵەمی: " : locale === "en" ? "Written by: " : "بقلم: "}
                  <strong className="text-[#2D2321]">
                    {chapter.authorProfile?.display_name || dict.common.partner}
                  </strong>
                </span>
                <span className="font-sans">{dict.reader.page} {4 + idx}</span>
              </div>
            </section>
          );
        })}

        {/* ================================================================== */}
        {/* FINAL CLOSING PAGE */}
        {/* ================================================================== */}
        <section className="min-h-[297mm] p-[20mm] flex flex-col justify-center text-center break-after-page bg-[#FAF7F2] border-[12px] border-double border-[#D48C84]/40">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-8 h-8 fill-[#7C2D37]/30" />
            </div>

            <h3 className="text-3xl font-extrabold text-[#2D2321]">
              {locale === "ku" ? "کۆتایی بەشی یەکەم.. و چیرۆکەکە بەردەوامە" : locale === "en" ? "End of Volume One.. and the Story Continues" : "نهاية الجزء الأول.. والقصة مستمرة"}
            </h3>

            <p className="text-sm text-[#7A6C68] leading-loose">
              {locale === "ku"
                ? "هەموو ڕۆژێک کە پێکەوە دەژین، لاپەڕەیەکی نوێیە لە کتێبی ژیانمان. سوپاس بۆ هەموو ساتێک کە ئەم حیکایەتەی کرد بە جوانترین چیرۆکی بوون."
                : locale === "en"
                ? "Every day we live together is a new page written in the book of our lives. Thank you for every moment that made this the most beautiful story."
                : "كل يوم نعيشه معًا هو صفحة جديدة تُكتب في كتاب عمرنا. شكرًا لكل لحظة جعلت من هذه الحكاية أجمل قصة في الوجود."}
            </p>

            <div className="pt-6 border-t border-[#EBE3DA]">
              <div className="text-sm font-bold text-[#7C2D37]">
                {book.partner1_name} &amp; {book.partner2_name}
              </div>
              <div className="text-xs text-[#7A6C68] mt-1 font-sans">
                {new Date().getFullYear().toLocaleString(dateLocale, { useGrouping: false })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
