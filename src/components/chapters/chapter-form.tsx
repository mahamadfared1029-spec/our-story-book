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
  Star,
  MapPin,
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
import { MILESTONE_TYPES, MOOD_TAGS } from "@/lib/types/database";

interface ChapterFormProps {
  bookId: string;
  chapter?: ChapterWithDetails;
  initialValues?: {
    title?: string;
    isMilestone?: boolean;
    milestoneType?: string;
    mood?: string;
    bodyPlaceholder?: string;
  };
}

const initialState: ChapterActionState = {
  error: null,
  success: false,
};

export function ChapterForm({ bookId, chapter, initialValues }: ChapterFormProps) {
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

  // Form State for dynamic controls
  const [isMilestone, setIsMilestone] = useState<boolean>(
    chapter?.is_milestone ?? initialValues?.isMilestone ?? false
  );
  const [selectedMilestoneType, setSelectedMilestoneType] = useState<string>(
    chapter?.milestone_type || initialValues?.milestoneType || "first_meet"
  );
  const [selectedMood, setSelectedMood] = useState<string | null>(
    chapter?.mood_tag || initialValues?.mood || "romantic"
  );

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

        <form action={formAction} className="space-y-6">
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
              defaultValue={chapter?.title || initialValues?.title || ""}
              placeholder="مثال: أول فنجان قهوة معًا، أو رحلتنا إلى شاطئ البحر"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
            />
          </div>

          {/* Event Date & Location in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Location (optional) */}
            <div>
              <label
                htmlFor="location"
                className="block text-xs font-semibold text-[#2D2321] mb-1.5"
              >
                المكان أو المدينة (اختياري)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#7A6C68]">
                  <MapPin className="w-4 h-4 text-[#7C2D37]" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  maxLength={100}
                  defaultValue={chapter?.location || ""}
                  placeholder="مثال: حديقة الأزهر، القاهرة"
                  className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DA] text-[#2D2321] text-sm focus:bg-white focus:border-[#7C2D37] focus:ring-1 focus:ring-[#7C2D37] transition-all outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Milestone Toggle & Type Selection */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA] space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="is_milestone"
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="is_milestone"
                  name="is_milestone"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7C2D37] border-[#EBE3DA] focus:ring-[#7C2D37]"
                />
                <span className="text-xs font-bold text-[#2D2321] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#B9770E] fill-[#F5CBA7]/50" />
                  <span>محطة فارقة أو مناسبة كبرى في القصة</span>
                </span>
              </label>

              <span className="text-[11px] text-[#7A6C68]">
                ستظهر مميزة في الخط الزمني
              </span>
            </div>

            {isMilestone && (
              <div className="pt-2 border-t border-[#EBE3DA]/60">
                <label className="block text-[11px] font-semibold text-[#2D2321] mb-2">
                  اختر نوع المحطة الرئيسية:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(MILESTONE_TYPES).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedMilestoneType(type.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedMilestoneType === type.id
                          ? "bg-[#7C2D37] text-white border-[#7C2D37] shadow-2xs font-semibold"
                          : "bg-white text-[#4A3E3D] border-[#EBE3DA] hover:bg-[#FAF0EE]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="milestone_type"
                  value={selectedMilestoneType}
                />
              </div>
            )}
          </div>

          {/* Mood / Feeling Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2321] mb-2">
              طابع وشعور هذه اللحظة
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(MOOD_TAGS).map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() =>
                    setSelectedMood(selectedMood === mood.id ? null : mood.id)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedMood === mood.id
                      ? "bg-[#FAF0EE] text-[#7C2D37] border-[#7C2D37] shadow-2xs font-semibold"
                      : "bg-[#FAF7F2] text-[#7A6C68] border-[#EBE3DA] hover:bg-white"
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="mood_tag" value={selectedMood || ""} />
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
              placeholder={
                initialValues?.bodyPlaceholder ||
                "ما الذي حدث في هذا اليوم؟ كيف شعرتما؟ وما الكلمات التي لا تريدان نسيانها؟"
              }
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
                  ? "جاري الحفظ الآمن..."
                  : isEditing
                  ? "حفظ التعديلات"
                  : "توثيق الذكرى في كتابنا"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl border border-[#EBE3DA] max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FDEDEC] text-[#922B21] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#2D2321] text-center mb-2">
              تأكيد حذف هذا الفصل
            </h3>

            <p className="text-xs text-[#7A6C68] text-center leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في حذف هذا الفصل وصوره نهائيًا؟ لن يمكن استرجاع هذه الذكرى بعد حذفها.
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
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#922B21] hover:bg-[#78231B] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
