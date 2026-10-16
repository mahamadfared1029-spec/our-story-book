"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Edit3,
  Star,
  Heart,
  Sparkles,
  Crown,
  HeartHandshake,
  Compass,
  Gift,
  Home,
  Bookmark,
} from "lucide-react";
import type { ChapterWithDetails } from "@/lib/types/database";
import { MILESTONE_TYPES, MOOD_TAGS } from "@/lib/types/database";
import { formatArabicDate } from "@/lib/timeline";

interface TimelineNodeProps {
  chapter: ChapterWithDetails;
  bookId: string;
  currentUserId: string;
  isLast?: boolean;
}

export function TimelineNode({
  chapter,
  bookId,
  currentUserId,
  isLast = false,
}: TimelineNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAuthor = chapter.author_id === currentUserId;

  const milestoneInfo = chapter.milestone_type
    ? MILESTONE_TYPES[chapter.milestone_type as keyof typeof MILESTONE_TYPES]
    : null;

  const moodInfo = chapter.mood_tag
    ? MOOD_TAGS[chapter.mood_tag as keyof typeof MOOD_TAGS]
    : null;

  const formattedDate = formatArabicDate(chapter.event_date);

  const getMilestoneIcon = () => {
    switch (chapter.milestone_type) {
      case "first_meet":
        return <Sparkles className="w-4 h-4" />;
      case "proposal":
        return <HeartHandshake className="w-4 h-4" />;
      case "engagement":
        return <Crown className="w-4 h-4" />;
      case "wedding":
        return <Heart className="w-4 h-4 fill-current" />;
      case "trip":
        return <Compass className="w-4 h-4" />;
      case "anniversary":
        return <Gift className="w-4 h-4" />;
      case "new_home":
        return <Home className="w-4 h-4" />;
      case "special_moment":
        return <Star className="w-4 h-4 fill-current" />;
      default:
        return <Bookmark className="w-4 h-4" />;
    }
  };

  const isLongText = chapter.body.length > 280;
  const displayText =
    isLongText && !isExpanded ? `${chapter.body.slice(0, 280)}...` : chapter.body;

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Vertical timeline connector */}
      <div className="flex flex-col items-center self-stretch shrink-0">
        {/* Node Dot / Badge */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${
            chapter.is_milestone
              ? "bg-[#7C2D37] text-white ring-4 ring-[#FAF0EE] border border-[#7C2D37]"
              : "bg-white text-[#7C2D37] border-2 border-[#EBE3DA] group-hover:border-[#7C2D37]"
          }`}
        >
          {chapter.is_milestone ? (
            getMilestoneIcon()
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-[#7C2D37]" />
          )}
        </div>

        {/* Connecting line to next node */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-[#EBE3DA] via-[#D48C84]/40 to-[#EBE3DA] my-2" />
        )}
      </div>

      {/* Main Chapter Content Card */}
      <div
        className={`flex-1 mb-8 bg-white rounded-3xl border p-5 sm:p-7 shadow-xs transition-all ${
          chapter.is_milestone
            ? "border-[#D48C84]/60 bg-gradient-to-b from-white via-white to-[#FAF7F2]/50 ring-1 ring-[#D48C84]/20"
            : "border-[#EBE3DA]"
        }`}
      >
        {/* Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Milestone Badge */}
            {chapter.is_milestone && milestoneInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${milestoneInfo.badgeClass}`}
              >
                {getMilestoneIcon()}
                <span>{milestoneInfo.label}</span>
              </span>
            )}

            {/* Mood Tag */}
            {moodInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${moodInfo.colorClass}`}
              >
                <span>{moodInfo.emoji}</span>
                <span>{moodInfo.label}</span>
              </span>
            )}

            {/* Location */}
            {chapter.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#7A6C68] bg-[#FAF7F2] border border-[#EBE3DA] px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-[#7C2D37]" />
                <span>{chapter.location}</span>
              </span>
            )}
          </div>

          {/* Edit Action */}
          {isAuthor && (
            <Link
              href={`/book/${bookId}/chapters/${chapter.id}/edit`}
              className="inline-flex items-center gap-1 text-xs text-[#7A6C68] hover:text-[#7C2D37] p-1.5 rounded-lg hover:bg-[#FAF0EE] transition-colors"
              title="تعديل هذا الفصل"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تعديل</span>
            </Link>
          )}
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-1.5 text-xs text-[#7A6C68] mb-2 font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#7C2D37]" />
          <span>{formattedDate}</span>
        </div>

        {/* Chapter Title */}
        <h3 className="text-lg sm:text-xl font-bold text-[#2D2321] tracking-tight mb-3">
          {chapter.title}
        </h3>

        {/* Chapter Body with Paragraph Formatting */}
        <div className="text-xs sm:text-sm text-[#4A3E3D] leading-relaxed whitespace-pre-line mb-4 font-normal">
          {displayText}
          {isLongText && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-block text-[#7C2D37] font-semibold text-xs mr-2 hover:underline focus:outline-hidden"
            >
              {isExpanded ? "عرض أقل" : "قراءة المزيد"}
            </button>
          )}
        </div>

        {/* Chapter Images Gallery */}
        {chapter.images && chapter.images.length > 0 && (
          <div
            className={`grid gap-3 pt-3 border-t border-[#EBE3DA]/60 ${
              chapter.images.length === 1
                ? "grid-cols-1"
                : chapter.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {chapter.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EBE3DA] shadow-2xs group/img"
              >
                {img.signedUrl ? (
                  <Image
                    src={img.signedUrl}
                    alt={chapter.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover/img:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#7A6C68]">
                    صورة خاصة
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Author signature footer */}
        <div className="mt-4 pt-3 border-t border-[#EBE3DA]/40 flex items-center justify-between text-[11px] text-[#7A6C68]">
          <span>
            كتبها:{" "}
            <span className="font-semibold text-[#2D2321]">
              {chapter.authorProfile?.display_name || "الشريك"}
            </span>
          </span>
          <span className="text-[10px] text-[#A89F91]">
            {new Date(chapter.created_at).toLocaleDateString("ar-EG")}
          </span>
        </div>
      </div>
    </div>
  );
}
