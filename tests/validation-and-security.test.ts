import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateBookInput,
  generateInviteCode,
  hashInviteCode,
} from "../src/lib/validations";

describe("1. التحقق من صحة المدخلات (Input Validations)", () => {
  describe("البريد الإلكتروني (Email)", () => {
    it("يقبل بريدًا إلكترونيًا صحيحًا", () => {
      const res = validateEmail("test@example.com");
      expect(res.success).toBe(true);
      expect(res.data).toBe("test@example.com");
    });

    it("يرفض البريد الفارغ أو المسافات فقط", () => {
      const res = validateEmail("   ");
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("يرفض صيغة البريد الإلكتروني غير الصحيحة", () => {
      const res = validateEmail("invalid-email");
      expect(res.success).toBe(false);
      expect(res.error).toContain("صيغة البريد");
    });
  });

  describe("كلمة المرور (Password)", () => {
    it("يقبل كلمة مرور قوية من 8 أحرف أو أكثر", () => {
      const res = validatePassword("securePass123");
      expect(res.success).toBe(true);
    });

    it("يرفض كلمات المرور القصيرة (أقل من 8 أحرف) لحماية الأمان", () => {
      const res = validatePassword("1234567");
      expect(res.success).toBe(false);
      expect(res.error).toContain("8 أحرف");
    });
  });

  describe("الاسم المعروض (Display Name)", () => {
    it("يقبل اسمًا من حرفين إلى 50 حرفًا", () => {
      const res = validateDisplayName("يوسف");
      expect(res.success).toBe(true);
      expect(res.data).toBe("يوسف");
    });

    it("يرفض الاسم المكون من حرف واحد فقط", () => {
      const res = validateDisplayName("أ");
      expect(res.success).toBe(false);
      expect(res.error).toContain("حرفين");
    });

    it("يرفض الاسم الذي يتجاوز 50 حرفًا", () => {
      const longName = "أ".repeat(51);
      const res = validateDisplayName(longName);
      expect(res.success).toBe(false);
      expect(res.error).toContain("50 حرفًا");
    });
  });

  describe("بيانات الكتاب (Book Input)", () => {
    it("يقبل بيانات كتاب صالحة مع تاريخ سابق أو حالي", () => {
      const res = validateBookInput({
        name: "حكايتنا معًا",
        partner1_name: "أحمد",
        partner2_name: "سارة",
        story_start_date: "2023-05-15",
      });
      expect(res.success).toBe(true);
      expect(res.data?.name).toBe("حكايتنا معًا");
    });

    it("يرفض إذا كان عنوان الكتاب أقصر من حرفين", () => {
      const res = validateBookInput({
        name: "ك",
        partner1_name: "أحمد",
        partner2_name: "سارة",
        story_start_date: "2023-05-15",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("حرفين");
    });

    it("يرفض إذا كان اسم أي من الشريكين مفقودًا", () => {
      const res = validateBookInput({
        name: "قصة حبنا",
        partner1_name: "",
        partner2_name: "سارة",
        story_start_date: "2023-05-15",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("الشريك الأول");
    });

    it("يرفض إذا كان تاريخ بداية القصة في المستقبل", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const res = validateBookInput({
        name: "قصة حبنا",
        partner1_name: "أحمد",
        partner2_name: "سارة",
        story_start_date: futureDate.toISOString().split("T")[0],
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("المستقبل");
    });
  });
});

describe("2. نظام الدعوات الآمن والتشفير (Invite Cryptography & Security)", () => {
  it("يولّد رمز دعوة عشوائي قوي مشفر بـ Web Crypto API", () => {
    const code1 = generateInviteCode();
    const code2 = generateInviteCode();

    expect(code1).toBeDefined();
    expect(code1.length).toBe(48); // 24 bytes in hex
    expect(code1).not.toBe(code2); // Ensures randomness
  });

  it("يحسب تجزئة SHA-256 للرمز بدقة متطابقة لمدخل متماثل", async () => {
    const rawCode = "a1b2c3d4e5f6789012345678";
    const hash1 = await hashInviteCode(rawCode);
    const hash2 = await hashInviteCode(rawCode);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 produces 64 hex characters
    expect(hash1).not.toBe(rawCode); // Raw code is never identical to hash
  });

  it("يضمن أن الاختلاف الطفيف في الرمز ينتج تجزئة مختلفة تمامًا (Avalanche Effect)", async () => {
    const codeA = "abc123456789012345678901";
    const codeB = "abc123456789012345678902";

    const hashA = await hashInviteCode(codeA);
    const hashB = await hashInviteCode(codeB);

    expect(hashA).not.toBe(hashB);
  });
});

describe("3. قواعد عضوية الكتاب والأمان (Book Membership & Business Rules)", () => {
  it("يحاكي ويتحقق من شرط الحد الأقصى (عضوان فقط)", () => {
    const members = [
      { user_id: "user-1", role: "creator" },
      { user_id: "user-2", role: "partner" },
    ];

    const canAddThirdMember = (currentCount: number) => {
      if (currentCount >= 2) {
        return { allowed: false, error: "لا يمكن إضافة أكثر من شريكين" };
      }
      return { allowed: true };
    };

    const attempt = canAddThirdMember(members.length);
    expect(attempt.allowed).toBe(false);
    expect(attempt.error).toContain("أكثر من شريكين");
  });

  it("يتحقق من حالات رفض قبول الدعوة (منتهية الصلاحية أو ملغاة)", () => {
    const now = new Date();

    const expiredInvite = {
      used_at: null,
      revoked_at: null,
      expires_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // expired 1h ago
    };

    interface TestInvite {
      used_at: string | null;
      revoked_at: string | null;
      expires_at: string;
    }

    const isInviteValid = (invite: TestInvite) => {
      if (invite.used_at !== null) return { valid: false, reason: "used" };
      if (invite.revoked_at !== null) return { valid: false, reason: "revoked" };
      if (new Date(invite.expires_at) <= new Date()) return { valid: false, reason: "expired" };
      return { valid: true };
    };

    expect(isInviteValid(expiredInvite).valid).toBe(false);
    expect(isInviteValid(expiredInvite).reason).toBe("expired");

    const usedInvite = {
      used_at: new Date().toISOString(),
      revoked_at: null,
      expires_at: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
    };
    expect(isInviteValid(usedInvite).valid).toBe(false);
    expect(isInviteValid(usedInvite).reason).toBe("used");

    const revokedInvite = {
      used_at: null,
      revoked_at: new Date().toISOString(),
      expires_at: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
    };
    expect(isInviteValid(revokedInvite).valid).toBe(false);
    expect(isInviteValid(revokedInvite).reason).toBe("revoked");
  });
});
