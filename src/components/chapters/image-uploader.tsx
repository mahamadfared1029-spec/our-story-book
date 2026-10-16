"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, AlertCircle } from "lucide-react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_CHAPTER,
} from "@/lib/validations";
import type { ChapterImageWithUrl } from "@/lib/types/database";

interface ImageUploaderProps {
  existingImages?: ChapterImageWithUrl[];
  onDeleteExisting?: (imageId: string, storagePath: string) => Promise<void>;
  disabled?: boolean;
}

export function ImageUploader({
  existingImages = [],
  onDeleteExisting,
  disabled = false,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCurrent = existingImages.length + previews.length;
  const remainingSlots = MAX_IMAGES_PER_CHAPTER - totalCurrent;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (files.length > remainingSlots) {
      setError(
        `يمكنك إضافة ${remainingSlots} صور فقط كحد أقصى (الحد الأقصى هو ${MAX_IMAGES_PER_CHAPTER} صور لكل فصل).`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        setError(`صيغة الملف (${file.name}) غير مدعومة. يرجى اختيار صور بصيغة JPG أو PNG أو WebP.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`حجم الصورة (${file.name}) يتجاوز 5 ميجابايت.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    // Generate local previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index]);
      updated.splice(index, 1);
      return updated;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#2D2321]">
          صور الذكرى (اختياري - من 1 إلى 3 صور)
        </label>
        <span className="text-[11px] text-[#7A6C68]">
          {totalCurrent} من {MAX_IMAGES_PER_CHAPTER} صور
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FDEDEC] border border-[#FADBD8] text-[#922B21] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Images */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Images */}
        {existingImages.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-xl overflow-hidden border border-[#EBE3DA] bg-[#FAF7F2] group"
          >
            {img.signedUrl ? (
              <Image
                src={img.signedUrl}
                alt="صورة الذكرى"
                fill
                sizes="(max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#7A6C68]">
                صورة محفوظة
              </div>
            )}

            {onDeleteExisting && (
              <button
                type="button"
                onClick={() => onDeleteExisting(img.id, img.storage_path)}
                disabled={disabled}
                className="absolute top-1.5 end-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#7C2D37] transition-colors shadow-xs"
                title="حذف الصورة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* New Local Previews */}
        {previews.map((previewUrl, idx) => (
          <div
            key={previewUrl}
            className="relative aspect-square rounded-xl overflow-hidden border border-[#7C2D37]/30 bg-[#FAF7F2] group shadow-xs"
          >
            <Image
              src={previewUrl}
              alt="معاينة الصورة"
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removePreview(idx)}
              className="absolute top-1.5 end-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#7C2D37] transition-colors shadow-xs"
              title="إلغاء الصورة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Add Button */}
        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="aspect-square rounded-xl border-2 border-dashed border-[#EBE3DA] hover:border-[#7C2D37] hover:bg-[#FAF0EE]/30 transition-all flex flex-col items-center justify-center gap-1.5 text-[#7A6C68] hover:text-[#7C2D37]"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[11px] font-medium">إضافة صورة</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-[10px] text-[#7A6C68]">
        • الصور محمية تمامًا في تخزين مشفر خاص، بصيغ JPG أو PNG أو WebP وبحجم أقصى 5 ميجابايت لكل صورة.
      </p>
    </div>
  );
}
