import type { ChapterWithDetails } from "@/lib/types/database";

export interface StoryStats {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  formattedDuration: string;
  totalChapters: number;
  milestonesCount: number;
  totalImagesCount: number;
}

/**
 * Calculates story statistics including detailed duration breakdown in Arabic
 */
export function calculateStoryStats(
  storyStartDateStr: string,
  chapters: ChapterWithDetails[] = []
): StoryStats {
  const startDate = new Date(storyStartDateStr);
  const now = new Date();

  // Total days difference
  const diffTime = Math.max(0, now.getTime() - startDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Breakdown into years, months, days
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Format poetic duration in Arabic
  const parts: string[] = [];
  if (years > 0) {
    if (years === 1) parts.push("سنة واحدة");
    else if (years === 2) parts.push("سنتان");
    else if (years >= 3 && years <= 10) parts.push(`${years} سنوات`);
    else parts.push(`${years} سنة`);
  }

  if (months > 0) {
    if (months === 1) parts.push("شهر واحد");
    else if (months === 2) parts.push("شهران");
    else if (months >= 3 && months <= 10) parts.push(`${months} أشهر`);
    else parts.push(`${months} شهرًا`);
  }

  if (days > 0 || parts.length === 0) {
    if (days === 1) parts.push("يوم واحد");
    else if (days === 2) parts.push("يومان");
    else if (days >= 3 && days <= 10) parts.push(`${days} أيام`);
    else parts.push(`${days} يومًا`);
  }

  const formattedDuration = parts.join(" و ");

  // Count milestones & images
  const milestonesCount = chapters.filter((c) => c.is_milestone).length;
  const totalImagesCount = chapters.reduce(
    (sum, c) => sum + (c.images?.length || 0),
    0
  );

  return {
    totalDays,
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    formattedDuration,
    totalChapters: chapters.length,
    milestonesCount,
    totalImagesCount,
  };
}

export interface YearGroup {
  year: number;
  arabicYear: string;
  chapters: ChapterWithDetails[];
}

/**
 * Groups chapters chronologically by year with Arabic numerals & formatting
 */
export function groupChaptersByYear(
  chapters: ChapterWithDetails[],
  sortOrder: "asc" | "desc" = "asc"
): YearGroup[] {
  const sorted = [...chapters].sort((a, b) => {
    const timeA = new Date(a.event_date).getTime();
    const timeB = new Date(b.event_date).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  const groupsMap = new Map<number, ChapterWithDetails[]>();

  for (const chapter of sorted) {
    const year = new Date(chapter.event_date).getFullYear();
    const group = groupsMap.get(year) || [];
    group.push(chapter);
    groupsMap.set(year, group);
  }

  const result: YearGroup[] = [];
  for (const [year, groupedChapters] of groupsMap.entries()) {
    result.push({
      year,
      arabicYear: year.toLocaleString("ar-EG", { useGrouping: false }),
      chapters: groupedChapters,
    });
  }

  return result;
}

/**
 * Formats an event date in Arabic
 */
export function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
