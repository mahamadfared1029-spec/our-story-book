import { describe, it, expect } from "vitest";
import { getDictionary, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../src/lib/i18n";
import { ar } from "../src/lib/i18n/dictionaries/ar";
import { ku } from "../src/lib/i18n/dictionaries/ku";
import { en } from "../src/lib/i18n/dictionaries/en";

describe("نظام اللغات والترجمة (i18n & Multilingual Support - Arabic, Kurdish, English)", () => {
  it("يدعم اللغات الثلاث الأساسية: العربية، الكردية (السورانية)، والإنجليزية", () => {
    expect(SUPPORTED_LOCALES.ar).toBeDefined();
    expect(SUPPORTED_LOCALES.ku).toBeDefined();
    expect(SUPPORTED_LOCALES.en).toBeDefined();

    expect(SUPPORTED_LOCALES.ar.dir).toBe("rtl");
    expect(SUPPORTED_LOCALES.ku.dir).toBe("rtl");
    expect(SUPPORTED_LOCALES.en.dir).toBe("ltr");
  });

  it("يتحقق من أن اللغة الافتراضية للتطبيق هي العربية (Arabic First)", () => {
    expect(DEFAULT_LOCALE).toBe("ar");
  });

  it("يحتوي القاموس الكردي (Kurdish Sorani) على نصوص دقيقة وغنية وشاعرية", () => {
    expect(ku.common.appName).toBe("کتێبی چیرۆکمان");
    expect(ku.common.save).toBe("پاشەکەوتکردن");
    expect(ku.common.cancel).toBe("پاشگەزبوونەوە");
    expect(ku.common.login).toBe("چوونەژوورەوە");
    expect(ku.common.signup).toBe("دروستکردنی هەژمار");
    expect(ku.common.logout).toBe("چوونەدەرەوە");
    expect(ku.nav.myBooks).toBe("کتێبەکانم");
    expect(ku.nav.timeline).toBe("هێڵی کاتی");
    expect(ku.nav.previewBook).toBe("پێشبینینی کتێب");
    expect(ku.nav.printBook).toContain("چاپکردن");
    expect(ku.reader.dedication).toBe("پێشکەشکردن");
    expect(ku.reader.contents).toBe("پێڕستی بابەتەکان");
  });

  it("يضمن اكتمال جميع المفاتيح عبر القواميس الثلاثة دون أي نقص (Dictionary Parity)", () => {
    const checkParity = (
      source: Record<string, unknown>,
      target: Record<string, unknown>,
      path = ""
    ) => {
      for (const key of Object.keys(source)) {
        const fullPath = path ? `${path}.${key}` : key;
        expect(target, `Missing key in target: ${fullPath}`).toHaveProperty(key);

        const sourceVal = source[key];
        const targetVal = target[key];

        if (typeof sourceVal === "object" && sourceVal !== null) {
          checkParity(
            sourceVal as Record<string, unknown>,
            targetVal as Record<string, unknown>,
            fullPath
          );
        } else {
          expect(typeof targetVal).toBe("string");
          expect((targetVal as string).trim().length).toBeGreaterThan(0);
        }
      }
    };

    // Verify Kurdish has all Arabic keys
    checkParity(
      ar as unknown as Record<string, unknown>,
      ku as unknown as Record<string, unknown>,
      "ku"
    );
    // Verify English has all Arabic keys
    checkParity(
      ar as unknown as Record<string, unknown>,
      en as unknown as Record<string, unknown>,
      "en"
    );
    // Verify Arabic has all Kurdish keys
    checkParity(
      ku as unknown as Record<string, unknown>,
      ar as unknown as Record<string, unknown>,
      "ar"
    );
  });

  it("دالة getDictionary ترجع القاموس الصحيح وتوفر بديلاً آمنًا عند لغة غير معروفة", () => {
    const arDict = getDictionary("ar");
    expect(arDict.common.appName).toBe("كتاب قصتنا");

    const kuDict = getDictionary("ku");
    expect(kuDict.common.appName).toBe("کتێبی چیرۆکمان");

    const enDict = getDictionary("en");
    expect(enDict.common.appName).toBe("Our Story Book");

    // Fallback test
    // @ts-expect-error Testing invalid locale fallback
    const fallbackDict = getDictionary("invalid_code");
    expect(fallbackDict.common.appName).toBe("كتاب قصتنا");
  });
});
