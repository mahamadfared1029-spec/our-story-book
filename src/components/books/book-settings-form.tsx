"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Users,
  ShieldAlert,
} from "lucide-react";
import {
  updateBookAction,
  deleteBookAction,
  type BookActionState,
} from "@/actions/books";
import type { BookWithMembers } from "@/lib/types/database";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface BookSettingsFormProps {
  book: BookWithMembers;
  currentUserId: string;
}

const initialState: BookActionState = {
  error: null,
  success: false,
};

export function BookSettingsForm({ book, currentUserId }: BookSettingsFormProps) {
  const router = useRouter();
  const { dict, locale } = useTranslation();
  const updateActionWithId = updateBookAction.bind(null, book.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, initialState);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isCreator = book.members.some(
    (m) => m.user_id === currentUserId && m.role === "creator"
  );

  const today = new Date().toISOString().split("T")[0];

  const handleDeleteBook = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteBookAction(book.id);
      if (res.success) {
        setShowDeleteModal(false);
        router.push("/");
      } else {
        setDeleteError(res.error || (locale === "ku" ? "سڕینەوەی کتێب سەرکەوتوو نەبوو." : locale === "en" ? "Failed to delete book." : "فشل حذف الكتاب."));
        setIsDeleting(false);
      }
    } catch {
      setDeleteError(locale === "ku" ? "هەڵەیەکی چاوەڕواننەکراو ڕوویدا." : locale === "en" ? "An unexpected error occurred." : "حدث خطأ غير متوقع أثناء الحذف.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/book/${book.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
        >
          <ArrowRight className={`w-3.5 h-3.5 ${locale === "en" ? "rotate-180" : ""}`} />
          <span>{dict.print.backToBook}</span>
        </Link>

        <LanguageSwitcher />
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-3">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight">
            {dict.settings.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6C68] mt-1.5">
            {dict.settings.subtitle}
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Book Title */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              {dict.book.bookTitleLabel}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={book.name}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
            />
          </div>

          {/* Partner Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="partner1_name"
                className="block text-xs font-semibold text-[#2D2321] mb-1.5"
              >
                {dict.book.partner1Label}
              </label>
              <input
                id="partner1_name"
                name="partner1_name"
                type="text"
                required
                maxLength={50}
                defaultValue={book.partner1_name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="partner2_name"
                className="block text-xs font-semibold text-[#2D2321] mb-1.5"
              >
                {dict.book.partner2Label}
              </label>
              <input
                id="partner2_name"
                name="partner2_name"
                type="text"
                required
                maxLength={50}
                defaultValue={book.partner2_name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="story_start_date"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              {dict.book.startDateLabel}
            </label>
            <input
              id="story_start_date"
              name="story_start_date"
              type="date"
              required
              max={today}
              defaultValue={book.story_start_date}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
            />
            <p className="text-[11px] text-[#7A6C68] mt-1">
              {dict.book.startDateHint}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isPending ? dict.common.saving : dict.common.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Book Members Information Card */}
      <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBE3DA]">
          <Users className="w-5 h-5 text-[#7C2D37]" />
          <h3 className="text-sm font-bold text-[#2D2321]">{dict.settings.membersSection}</h3>
        </div>

        <div className="space-y-3">
          {book.members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA]"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#2D2321]">
                  {member.profile?.display_name || dict.common.partner}
                  {member.user_id === currentUserId && (
                    <span className="text-[#7C2D37] ms-1.5 font-normal">
                      {locale === "ku" ? "(تۆ)" : locale === "en" ? "(You)" : "(أنت)"}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#7A6C68]">
                  {locale === "ku" ? "بەشداریکردن: " : locale === "en" ? "Joined: " : "انضم في: "}
                  {new Date(member.joined_at).toLocaleDateString(locale === "en" ? "en-US" : locale === "ku" ? "ckb" : "ar-EG")}
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#EBE3DA] text-[#7C2D37]">
                {member.role === "creator" ? dict.common.creator : dict.common.partner}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Delete Book (Creator only) */}
      {isCreator && (
        <div className="bg-[#FDEDEC]/60 rounded-3xl border border-[#F5B7B1] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#922B21]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold">{dict.settings.dangerSection}</h3>
          </div>

          <p className="text-xs text-[#7A6C68] leading-relaxed">
            {dict.settings.deleteBookWarning}
          </p>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-[#922B21] hover:bg-[#78231B] text-white text-xs font-semibold transition-colors shadow-2xs inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{dict.settings.deleteConfirmButton}</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl border border-[#EBE3DA] max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FDEDEC] text-[#922B21] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#2D2321] text-center mb-2">
              {locale === "ku" ? "دووپاتکردنەوەی سڕینەوەی هەمیشەیی کتێب" : locale === "en" ? "Confirm Permanent Book Deletion" : "تأكيد حذف الكتاب نهائيًا"}
            </h3>

            <p className="text-xs text-[#7A6C68] text-center leading-relaxed mb-6">
              {locale === "ku"
                ? `ئایا دڵنیایت لە سڕینەوەی کتێبی «${book.name}»؟ هەموو بەشەکان، وێنەکان و تۆماری هاوبەشەکان دەستبەجێ بۆ هەمیشە دەسڕێنەوە.`
                : locale === "en"
                ? `Are you sure you want to delete «${book.name}»? All chapters, photos, and partner records will be permanently removed immediately.`
                : `هل أنت متأكد من رغبتك في حذف كتاب «${book.name}»؟ سيتم حذف كافة الفصول والصور وسجلات الشركاء فورًا وبشكل دائم.`}
            </p>

            {deleteError && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#FDEDEC] text-[#922B21] text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F0ECE6] text-[#2D2321] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {dict.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#922B21] hover:bg-[#78231B] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? dict.common.deleting : dict.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
