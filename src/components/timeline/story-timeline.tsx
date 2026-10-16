"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowUpDown,
  Star,
  Plus,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import type { ChapterWithDetails } from "@/lib/types/database";
import { groupChaptersByYear } from "@/lib/timeline";
import { TimelineNode } from "./timeline-node";
import { ChapterCard } from "@/components/chapters/chapter-card";

interface StoryTimelineProps {
  chapters: ChapterWithDetails[];
  bookId: string;
  currentUserId: string;
}

export function StoryTimeline({
  chapters,
  bookId,
  currentUserId,
}: StoryTimelineProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "cards">("timeline");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [onlyMilestones, setOnlyMilestones] = useState<boolean>(false);

  // Filter chapters
  const filteredChapters = onlyMilestones
    ? chapters.filter((c) => c.is_milestone)
    : chapters;

  // Group chapters by year
  const yearGroups = groupChaptersByYear(filteredChapters, sortOrder);

  // If no chapters at all in the book
  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#EBE3DA] p-10 sm:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FAF0EE] text-[#7C2D37] mx-auto flex items-center justify-center mb-4 ring-8 ring-[#FAF0EE]/50">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#2D2321] mb-2">
          ابدآ أول فصل من قصتكما
        </h3>
        <p className="text-xs sm:text-sm text-[#7A6C68] max-w-md mx-auto leading-relaxed mb-6">
          الصفحات تنتظر لحظاتكما الجميلة. وثقا أول لقاء، أول سفر، أو تفاصيل يوم لا تريدان نسيانه مع إضافة الصور الخاصة.
        </p>
        <Link
          href={`/book/${bookId}/chapters/new`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C2D37] text-white text-sm font-semibold hover:bg-[#67222B] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>كتابة أول فصل الآن</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#EBE3DA] p-3 sm:px-5 sm:py-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: View switchers & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switch (Timeline vs Cards) */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE3DA]/70">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "timeline"
                  ? "bg-white text-[#7C2D37] shadow-2xs"
                  : "text-[#7A6C68] hover:text-[#2D2321]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>مخطط زمني</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-[#7C2D37] shadow-2xs"
                  : "text-[#7A6C68] hover:text-[#2D2321]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
          </div>

          {/* Milestones Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyMilestones(!onlyMilestones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              onlyMilestones
                ? "bg-[#FEF9E7] text-[#B7950B] border-[#F9E79F] font-semibold"
                : "bg-white text-[#7A6C68] border-[#EBE3DA] hover:bg-[#FAF7F2]"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyMilestones ? "fill-current" : ""
              }`}
            />
            <span>المحطات الفارقة فقط</span>
          </button>
        </div>

        {/* Right: Sort & Add */}
        <div className="flex items-center gap-2">
          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FAF7F2] hover:bg-[#F0ECE6] border border-[#EBE3DA] text-[#2D2321] transition-colors"
            title="تبديل ترتيب العرض الزمني"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7C2D37]" />
            <span>
              {sortOrder === "asc" ? "من الأقدم للأحدث" : "من الأحدث للأقدم"}
            </span>
          </button>

          <Link
            href={`/book/${bookId}/chapters/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>فصل جديد</span>
          </Link>
        </div>
      </div>

      {/* No matching filter results */}
      {filteredChapters.length === 0 && onlyMilestones && (
        <div className="bg-white rounded-3xl border border-[#EBE3DA] p-8 text-center shadow-xs">
          <Star className="w-10 h-10 text-[#B9770E] mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#2D2321] mb-1">
            لا توجد محطات فارقة مسجلة بعد
          </h4>
          <p className="text-xs text-[#7A6C68] mb-4">
            يمكنك تمييز أي فصل كمحطة فارقة (أول لقاء، خطوبة، زفاف، سفر...) أثناء كتابته أو تعديله.
          </p>
          <button
            type="button"
            onClick={() => setOnlyMilestones(false)}
            className="text-xs font-semibold text-[#7C2D37] hover:underline"
          >
            إلغاء التصفية وعرض كل الفصول
          </button>
        </div>
      )}

      {/* Main Display: Timeline vs Cards */}
      {viewMode === "timeline" ? (
        <div className="space-y-10">
          {yearGroups.map((group) => (
            <div key={group.year} className="relative">
              {/* Year Marker Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-1.5 rounded-full bg-[#7C2D37] text-white text-xs font-bold shadow-2xs font-sans tracking-wide">
                  عام {group.arabicYear}
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-l from-[#EBE3DA] to-[#D48C84]/30" />
                <span className="text-[11px] text-[#7A6C68] font-medium">
                  {group.chapters.length}{" "}
                  {group.chapters.length === 1 ? "ذكرى" : "ذكريات"}
                </span>
              </div>

              {/* Year Chapters Nodes */}
              <div className="pr-2 sm:pr-4">
                {group.chapters.map((chapter, idx) => (
                  <TimelineNode
                    key={chapter.id}
                    chapter={chapter}
                    bookId={bookId}
                    currentUserId={currentUserId}
                    isLast={idx === group.chapters.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cards Mode (Grid / List) */
        <div className="grid grid-cols-1 gap-6">
          {filteredChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              bookId={bookId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
