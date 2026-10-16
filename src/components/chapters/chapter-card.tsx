"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Edit3, User, X } from "lucide-react";
import type { ChapterWithDetails } from "@/lib/types/database";

interface ChapterCardProps {
  chapter: ChapterWithDetails;
  bookId: string;
  currentUserId: string;
}

export function ChapterCard({ chapter, bookId, currentUserId }: ChapterCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const eventDate = new Date(chapter.event_date);
  const formattedDate = eventDate.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isAuthor = chapter.author_id === currentUserId;
  const authorName = chapter.authorProfile?.display_name || "شريك القصة";

  return (
    <article className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-7 shadow-xs hover:border-[#D48C84]/60 transition-all relative overflow-hidden group">
      {/* Top subtle highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#7C2D37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header: Date, Author & Edit */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EBE3DA]">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6C68]">
          <div className="flex items-center gap-1.5 font-medium text-[#7C2D37] bg-[#FAF0EE] px-2.5 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <User className="w-3.5 h-3.5 text-[#7A6C68]" />
            <span>بقلم: {authorName}</span>
            {isAuthor && (
              <span className="text-[10px] text-[#7C2D37] font-semibold">(أنت)</span>
            )}
          </div>
        </div>

        <Link
          href={`/book/${bookId}/chapters/${chapter.id}/edit`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] px-2.5 py-1 rounded-lg hover:bg-[#FAF0EE] transition-colors"
          title="تعديل هذا الفصل"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">تعديل</span>
        </Link>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#2D2321] mb-3 leading-snug">
        {chapter.title}
      </h3>

      {/* Body text with paragraphs */}
      <div className="text-xs sm:text-sm text-[#2D2321]/90 leading-relaxed sm:leading-loose whitespace-pre-line mb-5">
        {chapter.body}
      </div>

      {/* Image Gallery (1, 2, or 3 images) */}
      {chapter.images && chapter.images.length > 0 && (
        <div
          className={`grid gap-3 pt-2 ${
            chapter.images.length === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : chapter.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {chapter.images.map((img, index) => {
            if (!img.signedUrl) return null;
            return (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img.signedUrl!)}
                className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#EBE3DA] bg-[#FAF7F2] cursor-pointer group/img shadow-2xs hover:shadow-md transition-all"
              >
                <Image
                  src={img.signedUrl}
                  alt={`صورة ${index + 1} من ذكرى: ${chapter.title}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 end-0 text-white hover:text-[#D48C84] transition-colors p-2"
              title="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="معاينة الصورة بالحجم الكامل"
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
