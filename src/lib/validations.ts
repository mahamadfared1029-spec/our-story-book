/**
 * Validation rules and Cryptographic utilities for Our Story Book
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateEmail(email: string): ValidationResult<string> {
  const trimmed = email?.trim() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed) {
    return { success: false, error: "البريد الإلكتروني مطلوب." };
  }
  if (!emailRegex.test(trimmed)) {
    return { success: false, error: "صيغة البريد الإلكتروني غير صحيحة." };
  }
  return { success: true, data: trimmed.toLowerCase() };
}

export function validatePassword(password: string): ValidationResult<string> {
  if (!password || password.length < 8) {
    return { success: false, error: "كلمة المرور يجب أن لا تقل عن 8 أحرف لضمان الأمان." };
  }
  return { success: true, data: password };
}

export function validateDisplayName(name: string): ValidationResult<string> {
  const trimmed = name?.trim() || "";
  if (trimmed.length < 2) {
    return { success: false, error: "الاسم يجب أن يتكون من حرفين على الأقل." };
  }
  if (trimmed.length > 50) {
    return { success: false, error: "الاسم يجب ألا يتجاوز 50 حرفًا." };
  }
  return { success: true, data: trimmed };
}

export interface BookInput {
  name: string;
  partner1_name: string;
  partner2_name: string;
  story_start_date: string;
}

export function validateBookInput(input: Partial<BookInput>): ValidationResult<BookInput> {
  const name = input.name?.trim() || "";
  const partner1 = input.partner1_name?.trim() || "";
  const partner2 = input.partner2_name?.trim() || "";
  const dateStr = input.story_start_date?.trim() || "";

  if (name.length < 2 || name.length > 100) {
    return { success: false, error: "عنوان الكتاب يجب أن يكون بين حرفين و100 حرف." };
  }

  if (partner1.length < 1 || partner1.length > 50) {
    return { success: false, error: "اسم الشريك الأول مطلوب (1 - 50 حرفًا)." };
  }

  if (partner2.length < 1 || partner2.length > 50) {
    return { success: false, error: "اسم الشريك الثاني مطلوب (1 - 50 حرفًا)." };
  }

  if (!dateStr) {
    return { success: false, error: "تاريخ بداية القصة مطلوب." };
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return { success: false, error: "تاريخ بداية القصة غير صالح." };
  }

  const now = new Date();
  if (parsedDate > now) {
    return { success: false, error: "تاريخ بداية القصة لا يمكن أن يكون في المستقبل." };
  }

  return {
    success: true,
    data: {
      name,
      partner1_name: partner1,
      partner2_name: partner2,
      story_start_date: dateStr,
    },
  };
}

export const VALID_MILESTONE_TYPES = [
  "first_meet",
  "proposal",
  "engagement",
  "wedding",
  "trip",
  "anniversary",
  "new_home",
  "special_moment",
  "other",
] as const;

export const VALID_MOOD_TAGS = [
  "romantic",
  "joyful",
  "funny",
  "nostalgic",
  "cozy",
  "peaceful",
  "special",
] as const;

export interface ChapterInput {
  title: string;
  event_date: string;
  body: string;
  is_milestone?: boolean;
  milestone_type?: string | null;
  mood_tag?: string | null;
  location?: string | null;
}

export function validateChapterInput(input: Partial<ChapterInput>): ValidationResult<ChapterInput> {
  const title = input.title?.trim() || "";
  const event_date = input.event_date?.trim() || "";
  const body = input.body?.trim() || "";
  const is_milestone = Boolean(input.is_milestone);
  const milestone_type = input.milestone_type?.trim() || null;
  const mood_tag = input.mood_tag?.trim() || null;
  const location = input.location?.trim() || null;

  if (title.length < 2 || title.length > 150) {
    return { success: false, error: "عنوان الفصل يجب أن يكون بين حرفين و150 حرفًا." };
  }

  if (!event_date) {
    return { success: false, error: "تاريخ الحدث أو الذكرى مطلوب." };
  }

  const parsedDate = new Date(event_date);
  if (isNaN(parsedDate.getTime())) {
    return { success: false, error: "تاريخ الحدث غير صالح." };
  }

  const now = new Date();
  if (parsedDate > now) {
    return { success: false, error: "تاريخ الذكرى لا يمكن أن يكون في المستقبل." };
  }

  if (body.length < 5) {
    return { success: false, error: "محتوى الفصل يجب أن يحتوي على 5 أحرف على الأقل." };
  }

  if (is_milestone && milestone_type && !VALID_MILESTONE_TYPES.includes(milestone_type as (typeof VALID_MILESTONE_TYPES)[number])) {
    return { success: false, error: "نوع المعلم الرئيسي المحدد غير صالح." };
  }

  if (mood_tag && !VALID_MOOD_TAGS.includes(mood_tag as (typeof VALID_MOOD_TAGS)[number])) {
    return { success: false, error: "طابع أو شعور الذكرى المحدد غير صالح." };
  }

  if (location && location.length > 100) {
    return { success: false, error: "اسم المكان يجب ألا يتجاوز 100 حرف." };
  }

  return {
    success: true,
    data: {
      title,
      event_date,
      body,
      is_milestone,
      milestone_type: is_milestone ? milestone_type : null,
      mood_tag,
      location,
    },
  };
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_CHAPTER = 3;

export function validateImageFile(file: { type: string; size: number; name: string }): ValidationResult<boolean> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: `نوع الملف (${file.name}) غير مدعوم. الأنواع المسموح بها فقط هي JPG و PNG و WebP.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: `حجم الصورة (${file.name}) يتجاوز الحد الأقصى المسموح به (5 ميجابايت).`,
    };
  }

  return { success: true, data: true };
}

/**
 * Generates a cryptographically strong random token for partner invites.
 */
export function generateInviteCode(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Calculates SHA-256 hash of the invite token for secure storage.
 */
export async function hashInviteCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
