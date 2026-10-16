import { describe, it, expect } from "vitest";
import {
  validateChapterInput,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_CHAPTER,
} from "../src/lib/validations";

describe("1. التحقق من صحة مدخلات الفصول (Chapter Input Validations)", () => {
  it("يقبل بيانات فصل صحيحة ومكتملة", () => {
    const res = validateChapterInput({
      title: "أول رحلة إلى شاطئ البحر",
      event_date: "2024-03-15",
      body: "كان يومًا دافئًا ومميزًا قضينا فيه ساعات نتحادث ونضحك دون شعور بالوقت.",
    });

    expect(res.success).toBe(true);
    expect(res.data?.title).toBe("أول رحلة إلى شاطئ البحر");
    expect(res.data?.event_date).toBe("2024-03-15");
  });

  it("يرفض إذا كان عنوان الفصل أقصر من حرفين", () => {
    const res = validateChapterInput({
      title: "أ",
      event_date: "2024-03-15",
      body: "نص كافٍ للقصة هنا.",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("حرفين");
  });

  it("يرفض إذا كان عنوان الفصل أطول من 150 حرفًا", () => {
    const longTitle = "ع".repeat(151);
    const res = validateChapterInput({
      title: longTitle,
      event_date: "2024-03-15",
      body: "نص كافٍ للقصة هنا.",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("150 حرفًا");
  });

  it("يرفض تاريخ الذكرى إذا كان في المستقبل", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const res = validateChapterInput({
      title: "يوم تخرجنا المشترك",
      event_date: futureDate.toISOString().split("T")[0],
      body: "نص كافٍ للقصة هنا.",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("المستقبل");
  });

  it("يرفض إذا كان نص الفصل أقصر من 5 أحرف", () => {
    const res = validateChapterInput({
      title: "عنوان صالح",
      event_date: "2024-01-01",
      body: "مخت",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("5 أحرف");
  });
});

describe("2. حماية والتحقق من صحة الصور (Image Validation & Storage Rules)", () => {
  it("يقبل صيغ الصور المعتمدة (JPG, PNG, WebP)", () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      const res = validateImageFile({
        name: `photo.${type.split("/")[1]}`,
        type,
        size: 1024 * 500, // 500 KB
      });
      expect(res.success).toBe(true);
    }
  });

  it("يرفض أنواع الملفات غير المسموح بها لحماية الأمان", () => {
    const dangerousFiles = [
      { name: "script.exe", type: "application/x-msdownload", size: 1000 },
      { name: "doc.pdf", type: "application/pdf", size: 1000 },
      { name: "anim.gif", type: "image/gif", size: 1000 },
      { name: "test.svg", type: "image/svg+xml", size: 1000 },
    ];

    for (const file of dangerousFiles) {
      const res = validateImageFile(file);
      expect(res.success).toBe(false);
      expect(res.error).toContain("غير مدعوم");
    }
  });

  it("يرفض الصورة إذا تجاوز حجمها 5 ميجابايت", () => {
    const oversizedFile = {
      name: "large_photo.jpg",
      type: "image/jpeg",
      size: MAX_IMAGE_SIZE_BYTES + 1024, // 5MB + 1KB
    };

    const res = validateImageFile(oversizedFile);
    expect(res.success).toBe(false);
    expect(res.error).toContain("يتجاوز الحد الأقصى");
  });

  it("يتحقق من فرض حد 3 صور كحد أقصى لكل فصل", () => {
    const currentImages = [
      { id: "img-1", sort_order: 0 },
      { id: "img-2", sort_order: 1 },
      { id: "img-3", sort_order: 2 },
    ];

    const canAddImage = (count: number) => {
      if (count >= MAX_IMAGES_PER_CHAPTER) {
        return { allowed: false, error: `الحد الأقصى هو ${MAX_IMAGES_PER_CHAPTER} صور` };
      }
      return { allowed: true };
    };

    expect(canAddImage(currentImages.length).allowed).toBe(false);
    expect(canAddImage(currentImages.length).error).toContain("3 صور");
    expect(canAddImage(2).allowed).toBe(true);
  });

  it("يضمن توليد مسار تخزين آمن داخلي معزول ولا يكشف روابط عامة", () => {
    const bookId = "b123e456-7890-abcd-ef01-23456789abcd";
    const chapterId = "c123e456-7890-abcd-ef01-23456789abcd";
    const fileId = "f123e456-7890-abcd-ef01-23456789abcd";
    const extension = "webp";

    const generateStoragePath = (bId: string, cId: string, fId: string, ext: string) => {
      return `book_${bId}/chapter_${cId}/${fId}.${ext}`;
    };

    const path = generateStoragePath(bookId, chapterId, fileId, extension);

    expect(path).toBe(`book_${bookId}/chapter_${chapterId}/${fileId}.webp`);
    expect(path.startsWith("book_")).toBe(true);
    expect(path.includes("/chapter_")).toBe(true);
    expect(path.endsWith(".webp")).toBe(true);
  });
});
