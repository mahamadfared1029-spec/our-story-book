import { describe, it, expect } from "vitest";
import { validateBookInput } from "../src/lib/validations";

describe("إعدادات الكتاب وصلاحيات الحذف والإدارة (Book Settings & Management Rules)", () => {
  describe("التحقق من صحة تحديث بيانات الكتاب", () => {
    it("يقبل تحديث عنوان الكتاب وأسماء الشريكين وتاريخ البداية بنجاح", () => {
      const res = validateBookInput({
        name: "كتاب ذكرياتنا الأبدية",
        partner1_name: "عمر",
        partner2_name: "مريم",
        story_start_date: "2022-01-01",
      });

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe("كتاب ذكرياتنا الأبدية");
      expect(res.data?.partner1_name).toBe("عمر");
      expect(res.data?.partner2_name).toBe("مريم");
    });

    it("يرفض العنوان الفارغ أو القصير جدًا عند التحديث", () => {
      const res = validateBookInput({
        name: " ",
        partner1_name: "عمر",
        partner2_name: "مريم",
        story_start_date: "2022-01-01",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("يرفض تاريخ البداية غير الصالح أو المستقبلي", () => {
      const res = validateBookInput({
        name: "كتاب ذكرياتنا الأبدية",
        partner1_name: "عمر",
        partner2_name: "مريم",
        story_start_date: "2099-01-01",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("المستقبل");
    });
  });

  describe("صلاحيات الأدوار وحماية الحذف النهائي (Role Permissions & Deletion Guard)", () => {
    interface Member {
      user_id: string;
      role: "creator" | "partner";
      display_name: string;
    }

    const members: Member[] = [
      { user_id: "user-creator-123", role: "creator", display_name: "المنشئ" },
      { user_id: "user-partner-456", role: "partner", display_name: "الشريك" },
    ];

    const canDeleteBook = (userId: string, memberList: Member[]) => {
      const currentMember = memberList.find((m) => m.user_id === userId);
      if (!currentMember) {
        return { allowed: false, reason: "ليس عضوًا في هذا الكتاب" };
      }
      if (currentMember.role !== "creator") {
        return { allowed: false, reason: "فقط منشئ الكتاب يملك صلاحية حذفه نهائيًا" };
      }
      return { allowed: true };
    };

    it("يسمح لمنشئ الكتاب (Creator) فقط بحذف الكتاب نهائيًا", () => {
      const result = canDeleteBook("user-creator-123", members);
      expect(result.allowed).toBe(true);
    });

    it("يمنع الشريك العادي (Partner) من حذف الكتاب نهائيًا حفاظًا على الذكريات المشتركة", () => {
      const result = canDeleteBook("user-partner-456", members);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("فقط منشئ الكتاب");
    });

    it("يمنع أي مستخدم خارجي غير مسجل في الكتاب من الحذف", () => {
      const result = canDeleteBook("user-stranger-789", members);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("ليس عضوًا");
    });
  });
});
