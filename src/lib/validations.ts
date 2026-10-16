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

  // Ensure story start date is not absurdly in the future
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

/**
 * Generates a cryptographically strong random token for partner invites.
 * Uses Web Crypto API (supported natively in Node.js 16+ and browsers).
 */
export function generateInviteCode(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Calculates SHA-256 hash of the invite token for secure storage.
 * The raw code is never stored in the database.
 */
export async function hashInviteCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
