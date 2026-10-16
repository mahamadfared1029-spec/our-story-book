"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  validateChapterInput,
  validateImageFile,
  MAX_IMAGES_PER_CHAPTER,
} from "@/lib/validations";
import type { ChapterWithDetails, Profile } from "@/lib/types/database";

export interface ChapterActionState {
  error?: string | null;
  success?: boolean;
}

/**
 * Creates a new chapter with up to 3 protected images in private storage
 */
export async function createChapterAction(
  bookId: string,
  prevState: ChapterActionState | null,
  formData: FormData
): Promise<ChapterActionState> {
  const title = formData.get("title") as string;
  const event_date = formData.get("event_date") as string;
  const body = formData.get("body") as string;

  const validation = validateChapterInput({
    title,
    event_date,
    body,
  });

  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "يجب تسجيل الدخول أولاً لإضافة فصل." };
  }

  // Verify user is a member of this book
  const { data: member } = await supabase
    .from("book_members")
    .select("role")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return { error: "أنت لست عضوًا في هذا الكتاب ولا يمكنك إضافة فصول إليه." };
  }

  // Process uploaded image files
  const rawFiles = formData.getAll("images") as File[];
  const validFiles = rawFiles.filter(
    (f) => f && typeof f === "object" && f.size > 0 && f.name !== "undefined"
  );

  if (validFiles.length > MAX_IMAGES_PER_CHAPTER) {
    return {
      error: `لا يمكن رفع أكثر من ${MAX_IMAGES_PER_CHAPTER} صور لكل فصل.`,
    };
  }

  // Validate each file
  for (const file of validFiles) {
    const fileVal = validateImageFile(file);
    if (!fileVal.success) {
      return { error: fileVal.error };
    }
  }

  // Insert chapter record
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .insert({
      book_id: bookId,
      author_id: user.id,
      title: validation.data!.title,
      event_date: validation.data!.event_date,
      body: validation.data!.body,
    })
    .select()
    .single();

  if (chapterError || !chapter) {
    console.error("Error creating chapter:", chapterError);
    return { error: "حدث خطأ أثناء حفظ الفصل في قاعدة البيانات." };
  }

  // Upload images to private storage bucket and insert into chapter_images
  const uploadedPaths: string[] = [];

  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const randomId = crypto.randomUUID();
      const storagePath = `book_${bookId}/chapter_${chapter.id}/${randomId}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("chapter-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`فشل رفع الصورة (${file.name}): ${uploadError.message}`);
      }

      uploadedPaths.push(storagePath);

      const { error: imageDbError } = await supabase
        .from("chapter_images")
        .insert({
          chapter_id: chapter.id,
          storage_path: storagePath,
          sort_order: i,
        });

      if (imageDbError) {
        throw new Error("فشل حفظ بيانات الصورة في قاعدة البيانات.");
      }
    }
  } catch (err: unknown) {
    console.error("Image upload rollback:", err);
    // Cleanup any uploaded images in case of failure to avoid orphaned storage files
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("chapter-images").remove(uploadedPaths);
    }
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء رفع الصور.";
    return { error: message };
  }

  revalidatePath(`/book/${bookId}`);
  redirect(`/book/${bookId}`);
}

/**
 * Updates an existing chapter and handles adding/removing images
 */
export async function updateChapterAction(
  chapterId: string,
  bookId: string,
  prevState: ChapterActionState | null,
  formData: FormData
): Promise<ChapterActionState> {
  const title = formData.get("title") as string;
  const event_date = formData.get("event_date") as string;
  const body = formData.get("body") as string;

  const validation = validateChapterInput({
    title,
    event_date,
    body,
  });

  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "يجب تسجيل الدخول أولاً." };
  }

  // Update chapter
  const { error: updateError } = await supabase
    .from("chapters")
    .update({
      title: validation.data!.title,
      event_date: validation.data!.event_date,
      body: validation.data!.body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chapterId)
    .eq("book_id", bookId);

  if (updateError) {
    console.error("Error updating chapter:", updateError);
    return { error: "فشل تحديث الفصل في قاعدة البيانات." };
  }

  // Check existing images count
  const { count: existingCount } = await supabase
    .from("chapter_images")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  const currentCount = existingCount || 0;

  // Process any newly added files
  const rawFiles = formData.getAll("images") as File[];
  const validFiles = rawFiles.filter(
    (f) => f && typeof f === "object" && f.size > 0 && f.name !== "undefined"
  );

  if (currentCount + validFiles.length > MAX_IMAGES_PER_CHAPTER) {
    return {
      error: `لا يمكن أن يحتوي الفصل على أكثر من ${MAX_IMAGES_PER_CHAPTER} صور إجمالاً (يوجد حاليًا ${currentCount} صور).`,
    };
  }

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    const fileVal = validateImageFile(file);
    if (!fileVal.success) {
      return { error: fileVal.error };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const randomId = crypto.randomUUID();
    const storagePath = `book_${bookId}/chapter_${chapterId}/${randomId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("chapter-images")
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (!uploadError) {
      await supabase.from("chapter_images").insert({
        chapter_id: chapterId,
        storage_path: storagePath,
        sort_order: currentCount + i,
      });
    }
  }

  revalidatePath(`/book/${bookId}`);
  redirect(`/book/${bookId}`);
}

/**
 * Safely deletes a chapter along with its physical storage files
 */
export async function deleteChapterAction(
  chapterId: string,
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول أولاً." };
    }

    // Fetch images to delete them from Supabase Storage
    const { data: images } = await supabase
      .from("chapter_images")
      .select("storage_path")
      .eq("chapter_id", chapterId);

    if (images && images.length > 0) {
      const pathsToDelete = images.map((img) => img.storage_path);
      await supabase.storage.from("chapter-images").remove(pathsToDelete);
    }

    // Delete chapter (DB foreign key CASCADE deletes rows in chapter_images)
    const { error: deleteError } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId)
      .eq("book_id", bookId);

    if (deleteError) {
      console.error("Error deleting chapter:", deleteError);
      return { success: false, error: "فشل حذف الفصل من قاعدة البيانات." };
    }

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch (err) {
    console.error("Error in deleteChapterAction:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء حذف الفصل." };
  }
}

/**
 * Deletes a single image from a chapter and storage
 */
export async function deleteChapterImageAction(
  imageId: string,
  storagePath: string,
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Remove from storage
    await supabase.storage.from("chapter-images").remove([storagePath]);

    // Remove record from database
    const { error } = await supabase
      .from("chapter_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      return { success: false, error: "فشل حذف الصورة من قاعدة البيانات." };
    }

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch {
    return { success: false, error: "حدث خطأ أثناء حذف الصورة." };
  }
}

/**
 * Fetches all chapters for a book with short-lived signed URLs for protected images
 */
export async function getBookChaptersWithImages(
  bookId: string
): Promise<ChapterWithDetails[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch chapters (RLS ensures user is member of book)
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("book_id", bookId)
      .order("event_date", { ascending: true });

    if (error || !chapters || chapters.length === 0) {
      return [];
    }

    const chapterIds = chapters.map((c) => c.id);
    const authorIds = Array.from(new Set(chapters.map((c) => c.author_id)));

    // 2. Fetch author profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", authorIds);

    const profilesMap: Record<string, Profile> = {};
    if (profiles) {
      for (const p of profiles) {
        profilesMap[p.id] = p;
      }
    }

    // 3. Fetch images for all chapters
    const { data: images } = await supabase
      .from("chapter_images")
      .select("*")
      .in("chapter_id", chapterIds)
      .order("sort_order", { ascending: true });

    // 4. Generate short-lived signed URLs for each image (valid for 1 hour)
    // NEVER expose public URLs for private relationship photos!
    const imagesByChapter: Record<string, Array<{ id: string; chapter_id: string; storage_path: string; sort_order: number; created_at: string; signedUrl?: string }>> = {};

    if (images && images.length > 0) {
      for (const img of images) {
        let signedUrl: string | undefined;

        try {
          const { data: signedData, error: signError } = await supabase.storage
            .from("chapter-images")
            .createSignedUrl(img.storage_path, 3600); // 1 hour expiration

          if (!signError && signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        } catch (e) {
          console.error("Error signing image URL:", e);
        }

        if (!imagesByChapter[img.chapter_id]) {
          imagesByChapter[img.chapter_id] = [];
        }

        imagesByChapter[img.chapter_id].push({
          ...img,
          signedUrl,
        });
      }
    }

    // Combine everything
    return chapters.map((chapter) => ({
      ...chapter,
      images: imagesByChapter[chapter.id] || [],
      authorProfile: profilesMap[chapter.author_id] || null,
    }));
  } catch (err) {
    console.error("Error fetching chapters with images:", err);
    return [];
  }
}

/**
 * Fetches a single chapter with details and signed images
 */
export async function getChapterById(
  chapterId: string,
  bookId: string
): Promise<ChapterWithDetails | null> {
  try {
    const supabase = await createClient();

    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", chapterId)
      .eq("book_id", bookId)
      .single();

    if (error || !chapter) {
      return null;
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", chapter.author_id)
      .single();

    // Fetch images
    const { data: images } = await supabase
      .from("chapter_images")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("sort_order", { ascending: true });

    const imagesWithUrls = [];
    if (images && images.length > 0) {
      for (const img of images) {
        let signedUrl: string | undefined;
        try {
          const { data: signedData, error: signError } = await supabase.storage
            .from("chapter-images")
            .createSignedUrl(img.storage_path, 3600);
          if (!signError && signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        } catch {
          // Ignore signing error
        }
        imagesWithUrls.push({
          ...img,
          signedUrl,
        });
      }
    }

    return {
      ...chapter,
      images: imagesWithUrls,
      authorProfile: profile || null,
    };
  } catch (err) {
    console.error("Error getting chapter by id:", err);
    return null;
  }
}
