import Link from "next/link";
import { BookOpen, Calendar, Heart, Plus, Sparkles, ArrowLeft, Shield, Users } from "lucide-react";
import { getCurrentUser } from "@/actions/auth";
import { getUserBooks } from "@/actions/books";
import { Navbar } from "@/components/ui/navbar";
import { getDictionary, SUPPORTED_LOCALES } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n/server";

export default async function HomePage() {
  const authData = await getCurrentUser();
  const books = authData ? await getUserBooks() : [];
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const config = SUPPORTED_LOCALES[locale];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {authData ? (
          /* Logged In View */
          <div className="space-y-10">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE3DA]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2321] tracking-tight">
                  {locale === "ku" ? `بەخێربێیت، ${authData.profile.display_name}` : locale === "en" ? `Welcome, ${authData.profile.display_name}` : `أهلاً بك، ${authData.profile.display_name}`}
                </h1>
                <p className="text-xs sm:text-sm text-[#7A6C68] mt-1">
                  {dict.common.tagline}
                </p>
              </div>

              <Link
                href="/book/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{dict.nav.newBook}</span>
              </Link>
            </div>

            {/* Books List or Empty State */}
            {books.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-[#EBE3DA] p-10 sm:p-16 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF0EE] text-[#7C2D37] mx-auto flex items-center justify-center mb-5">
                  <Heart className="w-8 h-8 fill-[#7C2D37]/20" />
                </div>
                <h2 className="text-xl font-bold text-[#2D2321] mb-2">
                  {dict.book.emptyChaptersTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6C68] leading-relaxed max-w-sm mx-auto mb-6">
                  {dict.home.emptyBooksSub}
                </p>
                <Link
                  href="/book/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C2D37] text-white text-xs font-semibold hover:bg-[#67222B] transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{dict.home.createFirstBook}</span>
                </Link>
              </div>
            ) : (
              /* Real Books Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book) => {
                  const startDate = new Date(book.story_start_date);
                  const now = new Date();
                  const diffDays = Math.ceil(
                    Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const dateLocale = locale === "en" ? "en-US" : locale === "ku" ? "ckb" : "ar-EG";
                  const formattedDate = startDate.toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  return (
                    <Link
                      key={book.id}
                      href={`/book/${book.id}`}
                      className="group bg-white rounded-2xl border border-[#EBE3DA] p-6 hover:border-[#D48C84] hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#7C2D37] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        <div className="flex items-center justify-between text-xs text-[#7A6C68] mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] font-semibold text-[11px]">
                            {book.partner1_name} &amp; {book.partner2_name}
                          </span>
                          <span className="text-[#C09A6B] font-medium text-[11px]">
                            {diffDays} {dict.common.day}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#2D2321] group-hover:text-[#7C2D37] transition-colors mb-2">
                          {book.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#7A6C68]">
                          <Calendar className="w-3.5 h-3.5 text-[#7C2D37]" />
                          <span>
                            {locale === "ku" ? `دەستپێک: ${formattedDate}` : locale === "en" ? `Start date: ${formattedDate}` : `بداية القصة: ${formattedDate}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#EBE3DA] flex items-center justify-between text-xs font-semibold text-[#7C2D37]">
                        <span>
                          {locale === "ku" ? "کردنەوەی کتێب و یادەوەرییەکان" : locale === "en" ? "Open Book & Memories" : "فتح الكتاب والذكريات"}
                        </span>
                        <ArrowLeft className={`w-4 h-4 transform ${config.dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"} transition-transform`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Public Hero Section */
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0EE] text-[#7C2D37] text-xs font-semibold border border-[#F2DDD9]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {locale === "ku" ? "شوێنێکی پارێزراو و تایبەت بۆ دوو کەس" : locale === "en" ? "A private and secure space for two partners" : "مساحة خاصة وآمنة لشخصين مرتبطين"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2D2321] tracking-tight leading-tight sm:leading-tight">
              {dict.home.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-[#7A6C68] max-w-xl mx-auto leading-relaxed">
              {dict.home.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C2D37] text-white text-sm font-semibold hover:bg-[#67222B] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                <span>{dict.home.startStory}</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#2D2321] text-sm font-semibold hover:bg-[#FAF7F2] border border-[#EBE3DA] transition-all flex items-center justify-center"
              >
                {dict.common.login}
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-start">
              <div className="bg-white p-5 rounded-2xl border border-[#EBE3DA] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#2D2321] mb-1">
                  {dict.home.privacyFeature}
                </h3>
                <p className="text-xs text-[#7A6C68] leading-relaxed">
                  {dict.home.privacyDesc}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EBE3DA] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#2D2321] mb-1">
                  {locale === "ku" ? "تەنیا دوو هاوبەش" : locale === "en" ? "Two Partners Only" : "شريكان فقط"}
                </h3>
                <p className="text-xs text-[#7A6C68] leading-relaxed">
                  {locale === "ku" ? "سیستەمێکی بانگهێشتی پارێزراو کە تەنیا هاتنەژوورەوەی هاوبەشەکەت مسۆگەر دەکات و ڕێگری لە هەر ئەندامێکی سێیەم دەکات." : locale === "en" ? "A secure cryptographic invite system ensuring only your partner joins and strictly barring any third person." : "نظام دعوة آمن ومشفر يضمن انضمام الشريك بدقة ويمنع أي عضو ثالث قطعيًا."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EBE3DA] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FAF0EE] text-[#7C2D37] flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#2D2321] mb-1">
                  {dict.home.printFeature}
                </h3>
                <p className="text-xs text-[#7A6C68] leading-relaxed">
                  {dict.home.printDesc}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBE3DA] py-6 text-center text-xs text-[#7A6C68]">
        {dict.common.appName} &copy; {new Date().getFullYear()} • {locale === "ku" ? "بە خۆشەویستی و خەمخۆری دروستکراوە" : locale === "en" ? "Crafted with love and care" : "صُمم بكل حب وعناية"}
      </footer>
    </div>
  );
}
