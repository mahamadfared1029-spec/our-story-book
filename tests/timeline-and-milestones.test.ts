import { describe, it, expect } from "vitest";
import {
  validateChapterInput,
  VALID_MILESTONE_TYPES,
  VALID_MOOD_TAGS,
} from "../src/lib/validations";
import {
  calculateStoryStats,
  groupChaptersByYear,
  formatArabicDate,
} from "../src/lib/timeline";
import { MEMORY_PROMPTS, getPromptById, getRandomPrompts } from "../src/lib/prompts";
import type { ChapterWithDetails } from "../src/lib/types/database";

describe("Phase 3: Milestone & Memory Validations", () => {
  const baseValidInput = {
    title: "أول لقاء بيننا",
    event_date: "2024-05-15",
    body: "جلسنا في ذلك المقهى الهادئ وتحدثنا لساعات طويلة.",
  };

  it("should accept valid chapter input without milestone metadata", () => {
    const res = validateChapterInput(baseValidInput);
    expect(res.success).toBe(true);
    expect(res.data?.is_milestone).toBe(false);
    expect(res.data?.milestone_type).toBeNull();
    expect(res.data?.mood_tag).toBeNull();
    expect(res.data?.location).toBeNull();
  });

  it("should accept valid chapter input with milestone and mood", () => {
    const res = validateChapterInput({
      ...baseValidInput,
      is_milestone: true,
      milestone_type: "first_meet",
      mood_tag: "romantic",
      location: "مقهى الروضة، القاهرة",
    });

    expect(res.success).toBe(true);
    expect(res.data?.is_milestone).toBe(true);
    expect(res.data?.milestone_type).toBe("first_meet");
    expect(res.data?.mood_tag).toBe("romantic");
    expect(res.data?.location).toBe("مقهى الروضة، القاهرة");
  });

  it("should reject invalid milestone type when is_milestone is true", () => {
    const res = validateChapterInput({
      ...baseValidInput,
      is_milestone: true,
      milestone_type: "invalid_type",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("نوع المعلم الرئيسي المحدد غير صالح");
  });

  it("should reject invalid mood tag", () => {
    const res = validateChapterInput({
      ...baseValidInput,
      mood_tag: "angry",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("طابع أو شعور الذكرى المحدد غير صالح");
  });

  it("should reject location exceeding 100 characters", () => {
    const res = validateChapterInput({
      ...baseValidInput,
      location: "أ".repeat(101),
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("اسم المكان يجب ألا يتجاوز 100 حرف");
  });

  it("should contain all expected milestone types in VALID_MILESTONE_TYPES", () => {
    expect(VALID_MILESTONE_TYPES).toContain("first_meet");
    expect(VALID_MILESTONE_TYPES).toContain("proposal");
    expect(VALID_MILESTONE_TYPES).toContain("engagement");
    expect(VALID_MILESTONE_TYPES).toContain("wedding");
    expect(VALID_MILESTONE_TYPES).toContain("trip");
    expect(VALID_MILESTONE_TYPES).toContain("anniversary");
  });

  it("should contain all expected mood tags in VALID_MOOD_TAGS", () => {
    expect(VALID_MOOD_TAGS).toContain("romantic");
    expect(VALID_MOOD_TAGS).toContain("joyful");
    expect(VALID_MOOD_TAGS).toContain("funny");
    expect(VALID_MOOD_TAGS).toContain("nostalgic");
  });
});

describe("Phase 3: Story Stats & Days Calculation", () => {
  const dummyChapters: ChapterWithDetails[] = [
    {
      id: "ch-1",
      book_id: "book-1",
      author_id: "user-1",
      title: "أول لقاء",
      event_date: "2023-01-01",
      body: "تفاصيل الذكرى الأولى...",
      is_milestone: true,
      milestone_type: "first_meet",
      mood_tag: "romantic",
      location: "القاهرة",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        { id: "img-1", chapter_id: "ch-1", storage_path: "p1", sort_order: 0, created_at: "" },
        { id: "img-2", chapter_id: "ch-1", storage_path: "p2", sort_order: 1, created_at: "" },
      ],
    },
    {
      id: "ch-2",
      book_id: "book-1",
      author_id: "user-1",
      title: "فنجان شاي",
      event_date: "2023-06-15",
      body: "تفاصيل الذكرى الثانية...",
      is_milestone: false,
      milestone_type: null,
      mood_tag: "cozy",
      location: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [],
    },
  ];

  it("should calculate elapsed days and poetic duration in Arabic", () => {
    // 1 year before today
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split("T")[0];

    const stats = calculateStoryStats(dateStr, dummyChapters);

    expect(stats.totalDays).toBeGreaterThanOrEqual(365);
    expect(stats.totalChapters).toBe(2);
    expect(stats.milestonesCount).toBe(1);
    expect(stats.totalImagesCount).toBe(2);
    expect(stats.formattedDuration).toContain("سنة");
  });

  it("should handle same-day start date gracefully", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const stats = calculateStoryStats(todayStr, []);

    expect(stats.totalDays).toBe(0);
    expect(stats.totalChapters).toBe(0);
    expect(stats.milestonesCount).toBe(0);
    expect(stats.totalImagesCount).toBe(0);
  });
});

describe("Phase 3: Timeline Grouping & Year Ordering", () => {
  const sampleChapters: ChapterWithDetails[] = [
    {
      id: "ch-2023",
      book_id: "book-1",
      author_id: "user-1",
      title: "ذكرى 2023",
      event_date: "2023-08-10",
      body: "محتوى الذكرى...",
      is_milestone: true,
      milestone_type: "first_meet",
      mood_tag: "romantic",
      location: null,
      created_at: "",
      updated_at: "",
      images: [],
    },
    {
      id: "ch-2024-a",
      book_id: "book-1",
      author_id: "user-1",
      title: "ذكرى 2024 الأولى",
      event_date: "2024-02-14",
      body: "محتوى الذكرى...",
      is_milestone: false,
      milestone_type: null,
      mood_tag: null,
      location: null,
      created_at: "",
      updated_at: "",
      images: [],
    },
    {
      id: "ch-2024-b",
      book_id: "book-1",
      author_id: "user-1",
      title: "ذكرى 2024 الثانية",
      event_date: "2024-11-20",
      body: "محتوى الذكرى...",
      is_milestone: true,
      milestone_type: "engagement",
      mood_tag: "special",
      location: null,
      created_at: "",
      updated_at: "",
      images: [],
    },
  ];

  it("should group chapters by year ascending", () => {
    const groups = groupChaptersByYear(sampleChapters, "asc");
    expect(groups.length).toBe(2);
    expect(groups[0].year).toBe(2023);
    expect(groups[0].chapters.length).toBe(1);
    expect(groups[1].year).toBe(2024);
    expect(groups[1].chapters.length).toBe(2);
  });

  it("should group chapters by year descending", () => {
    const groups = groupChaptersByYear(sampleChapters, "desc");
    expect(groups.length).toBe(2);
    expect(groups[0].year).toBe(2024);
    expect(groups[1].year).toBe(2023);
  });

  it("should format dates into readable Arabic strings", () => {
    const formatted = formatArabicDate("2024-10-17");
    expect(formatted).toBeTruthy();
    expect(formatted).toContain("٢٠٢٤");
  });
});

describe("Phase 3: Inspirational Memory Prompts", () => {
  it("should provide curated Arabic prompts with required categories", () => {
    expect(MEMORY_PROMPTS.length).toBeGreaterThanOrEqual(10);
    const categories = new Set(MEMORY_PROMPTS.map((p) => p.category));
    expect(categories.has("beginnings")).toBe(true);
    expect(categories.has("milestones")).toBe(true);
    expect(categories.has("travel")).toBe(true);
    expect(categories.has("daily")).toBe(true);
  });

  it("should retrieve prompt by id", () => {
    const prompt = getPromptById("first_meet");
    expect(prompt).toBeDefined();
    expect(prompt?.title).toContain("أول لقاء");
    expect(prompt?.isMilestone).toBe(true);
  });

  it("should return random prompts of specified count", () => {
    const randoms = getRandomPrompts(3);
    expect(randoms.length).toBe(3);
  });
});
