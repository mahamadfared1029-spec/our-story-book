"use client";

import { Heart, Calendar, BookOpen, Star, Image as ImageIcon } from "lucide-react";
import type { Book, ChapterWithDetails } from "@/lib/types/database";
import { calculateStoryStats } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/context";

interface StoryStatsCardProps {
  book: Book;
  chapters: ChapterWithDetails[];
}

export function StoryStatsCard({ book, chapters }: StoryStatsCardProps) {
  const stats = calculateStoryStats(book.story_start_date, chapters);
  const { dict, locale } = useTranslation();

  const dateLocale = locale === "en" ? "en-US" : locale === "ku" ? "ckb" : "ar-EG";
  const startDateFormatted = new Date(book.story_start_date).toLocaleDateString(
    dateLocale,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Top romantic accent line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left / Main info */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-[#7C2D37]/30" />
            <span>
              {book.partner1_name} &amp; {book.partner2_name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2321] tracking-tight">
            {book.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#7A6C68]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7C2D37]" />
              <span>
                {locale === "ku" ? `دەستپێک: ${startDateFormatted}` : locale === "en" ? `Start date: ${startDateFormatted}` : `بداية القصة: ${startDateFormatted}`}
              </span>
            </span>
            <span>•</span>
            <span className="font-semibold text-[#7C2D37]">
              {locale === "ku"
                ? `${stats.formattedDuration} لە خۆشەویستی هاوبەش`
                : locale === "en"
                ? `${stats.formattedDuration} of shared love`
                : `${stats.formattedDuration} من الحب المشترك`}
            </span>
          </div>
        </div>

        {/* Right / Big Days Counter Widget */}
        <div className="flex items-center gap-4 bg-[#FAF7F2] border border-[#EBE3DA] rounded-2xl p-4 sm:px-6 sm:py-4 self-stretch md:self-auto justify-center">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#7C2D37] tracking-tight font-sans">
              {stats.totalDays.toLocaleString(dateLocale)}
            </div>
            <div className="text-xs font-medium text-[#7A6C68] mt-0.5">
              {locale === "ku" ? "ڕۆژ لە گەشتەکەماندا" : locale === "en" ? "days on our journey" : "يومًا في رحلتنا"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick metrics row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#EBE3DA]">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA]/60">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#7C2D37] shadow-2xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-[#2D2321]">
              {stats.totalChapters.toLocaleString(dateLocale)}
            </div>
            <div className="text-[11px] text-[#7A6C68]">{dict.common.chapters}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA]/60">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#B9770E] shadow-2xs shrink-0">
            <Star className="w-4 h-4 fill-[#F5CBA7]/40" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-[#2D2321]">
              {stats.milestonesCount.toLocaleString(dateLocale)}
            </div>
            <div className="text-[11px] text-[#7A6C68]">{dict.common.milestones}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA]/60">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#21618C] shadow-2xs shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-[#2D2321]">
              {stats.totalImagesCount.toLocaleString(dateLocale)}
            </div>
            <div className="text-[11px] text-[#7A6C68]">{dict.common.photos}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
