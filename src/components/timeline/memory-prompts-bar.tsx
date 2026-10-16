"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, PenTool } from "lucide-react";
import { MEMORY_PROMPTS, type MemoryPrompt } from "@/lib/prompts";

interface MemoryPromptsBarProps {
  bookId: string;
}

export function MemoryPromptsBar({ bookId }: MemoryPromptsBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const categories = [
    { id: "all", label: "كل الأفكار" },
    { id: "beginnings", label: "البدايات" },
    { id: "milestones", label: "المحطات الكبرى" },
    { id: "travel", label: "السفر" },
    { id: "daily", label: "اليوميات" },
    { id: "deep", label: "مشاعر" },
  ];

  const filteredPrompts =
    selectedCategory === "all"
      ? MEMORY_PROMPTS
      : MEMORY_PROMPTS.filter((p) => p.category === selectedCategory);

  const displayedPrompts = isExpanded ? filteredPrompts : filteredPrompts.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-[#EBE3DA] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2321]">
              أفكار ملهمة لكتابة فصل جديد
            </h3>
            <p className="text-[11px] text-[#7A6C68]">
              اختر فكرة لتفتح لك صفحة الكتابة جاهزة بالعنوان والمشاعر
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-[#7C2D37] hover:underline shrink-0"
        >
          {isExpanded ? "عرض أقل" : `عرض المزيد (${filteredPrompts.length})`}
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? "bg-[#7C2D37] text-white shadow-2xs"
                : "bg-[#FAF7F2] text-[#7A6C68] hover:bg-[#F0ECE6] hover:text-[#2D2321]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {displayedPrompts.map((prompt: MemoryPrompt) => {
          const params = new URLSearchParams({
            title: prompt.title,
            isMilestone: prompt.isMilestone ? "true" : "false",
            ...(prompt.milestoneType ? { milestoneType: prompt.milestoneType } : {}),
            ...(prompt.suggestedMood ? { mood: prompt.suggestedMood } : {}),
            placeholder: prompt.placeholder,
          });

          return (
            <Link
              key={prompt.id}
              href={`/book/${bookId}/chapters/new?${params.toString()}`}
              className="group p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FAF0EE]/60 border border-[#EBE3DA] hover:border-[#D48C84]/60 transition-all flex flex-col justify-between text-right"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#EBE3DA] text-[#7C2D37]">
                    {prompt.categoryLabel}
                  </span>
                  {prompt.isMilestone && (
                    <span className="text-[10px] text-[#B9770E] font-medium">
                      ★ محطة مميزة
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-[#2D2321] group-hover:text-[#7C2D37] transition-colors line-clamp-1 mb-1">
                  {prompt.title}
                </h4>

                <p className="text-[11px] text-[#7A6C68] line-clamp-2 leading-relaxed">
                  {prompt.reflectionQuestion}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-[#EBE3DA]/60 flex items-center justify-between text-[11px] font-semibold text-[#7C2D37]">
                <span>اكتب هذا الفصل</span>
                <PenTool className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
