"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ArrowRight,
  BookOpen,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  createChapterAction,
  updateChapterAction,
  deleteChapterAction,
  deleteChapterImageAction,
  type ChapterActionState,
} from "@/actions/chapters";
import { ImageUploader } from "./image-uploader";
import type { ChapterWithDetails } from "@/lib/types/database";

interface ChapterFormProps {
  bookId: string;
  chapter?: ChapterWithDetails;
}

const initialState: ChapterActionState = {
  error: null,
  success: false,
};

export function ChapterForm({ bookId, chapter }: ChapterFormProps) {
  const isEditing = !!chapter;
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const boundAction = isEditing
    ? updateChapterAction.bind(null, chapter.id, bookId)
    : createChapterAction.bind(null, bookId);

  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!chapter) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteChapterAction(chapter.id, bookId);
      if (res.success) {
        router.push(`/book/${bookId}`);
      } else {
        setDeleteError(res.error || "فشل حذف الفصل.");
        setIsDeleting(false);
      }
    } catch {
      setDeleteError("حدث خطأ غير متوقع أثناء الحذف.");
      setIsDeleting(false);
    }
  };

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الصورة نهائيًا؟")) return;
    await deleteChapterImageAction(imageId, storagePath, bookId);
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header card */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/book/${bookId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C68] hover:text-[#7C2D37] transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للكتاب</span>
        </Link>

        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#922B21] hover:bg-[#FDEDEC] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف هذا الفصل</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-[#EBE3DA] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D48C84] via-[#7C2D37] to-[#D48C84]" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF0EE] text-[#7C2D37] mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2321] tracking-tight">
            {isEditing ? "تعديل فصل الذكرى" : "توثيق فصل جديد في القصة"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6C68] mt-1.5">
            اكتبا مشاعركما وتفاصيل هذه اللحظة التي تستحق أن تُخلد في كتابكما
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              عنوان الفصل أو الذكرى
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={chapter?.title || ""}
              placeholder="مثال: أول فنجان قهوة معًا، أو رحلتنا إلى شاطئ البحر"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
            />
          </div>

          {/* Event Date */}
          <div>
            <label
              htmlFor="event_date"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              تاريخ هذه الذكرى
            </label>
            <div className="relative">
              <input
                id="event_date"
                name="event_date"
                type="date"
                required
                max={today}
                defaultValue={chapter?.event_date || today}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
              />
            </div>
            <p className="text-[11px] text-[#7A6C68] mt-1">
              سيتم ترتيب فصول القصة زمنيًا بحسب هذا التاريخ
            </p>
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="body"
              className="block text-xs font-semibold text-[#2D2321] mb-1.5"
            >
              نص القصة والذكريات
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={6}
              defaultValue={chapter?.body || ""}
              placeholder="ما الذي حدث في هذا اليوم؟ كيف شعرتما؟ وما الكلمات التي لا تريدان نسيانها؟"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden leading-relaxed resize-y"
            />
          </div>

          {/* Image Uploader */}
          <div className="pt-2 border-t border-[#EBE3DA]">
            <ImageUploader
              existingImages={chapter?.images || []}
              onDeleteExisting={handleDeleteImage}
              disabled={isPending}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-[#7C2D37] text-white font-medium text-sm hover:bg-[#67222B] active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Heart className="w-4 h-4 fill-white/20" />
              )}
              <span>
                {isPending
                  ? isEditing
                    ? "جارٍ حفظ التعديلات..."
                    : "جارٍ حفظ الفصل والصور..."
                  : isEditing
                  ? "تحديث الفصل"
                  : "حفظ الفصل وإضافته للكتاب"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-[#EBE3DA]">
            <div className="w-12 h-12 rounded-full bg-[#FDEDEC] text-[#922B21] mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#2D2321]">
                تأكيد حذف الفصل
              </h3>
              <p className="text-xs text-[#7A6C68] mt-1.5 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الفصل وصوره نهائيًا؟ لن يمكن استرجاع هذه الذكرى بعد حذفها.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-[#FDEDEC] text-[#922B21] text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-[#922B21] text-white text-xs font-semibold hover:bg-[#78231B] transition-colors disabled:opacity-50"
              >
                {isDeleting ? "جارٍ الحذف..." : "نعم، حذف الفصل"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-[#F4EFEB] text-[#2D2321] text-xs font-semibold hover:bg-[#EBE3DA] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
