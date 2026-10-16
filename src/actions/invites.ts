"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode, hashInviteCode } from "@/lib/validations";

export interface InviteActionResult {
  success: boolean;
  error?: string;
  inviteCode?: string;
  inviteUrl?: string;
  bookId?: string;
}

export async function createPartnerInviteAction(bookId: string): Promise<InviteActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "يجب تسجيل الدخول لإنشاء رابط دعوة." };
    }

    // Verify user is a member of this book
    const { data: member } = await supabase
      .from("book_members")
      .select("role")
      .eq("book_id", bookId)
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return { success: false, error: "أنت لست عضوًا في هذا الكتاب." };
    }

    // Check current member count
    const { count, error: countError } = await supabase
      .from("book_members")
      .select("*", { count: "exact", head: true })
      .eq("book_id", bookId);

    if (countError) {
      return { success: false, error: "فشل التحقق من أعضاء الكتاب." };
    }

    if (count !== null && count >= 2) {
      return { success: false, error: "الكتاب يحتوي بالفعل على شريكين (الحد الأقصى مكتمل)." };
    }

    // Revoke previous pending unused invites for this book to avoid multiple active invite codes
    await supabase
      .from("invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("book_id", bookId)
      .is("used_at", null)
      .is("revoked_at", null);

    // Generate secure random invite token
    const rawCode = generateInviteCode();
    const codeHash = await hashInviteCode(rawCode);

    // 7 days expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await supabase.from("invites").insert({
      book_id: bookId,
      code_hash: codeHash,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error creating invite:", insertError);
      return { success: false, error: "فشل إنشاء رمز الدعوة في قاعدة البيانات." };
    }

    revalidatePath(`/book/${bookId}`);

    return {
      success: true,
      inviteCode: rawCode,
    };
  } catch (err) {
    console.error("Unexpected error in createPartnerInviteAction:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء إنشاء الدعوة." };
  }
}

export async function acceptPartnerInviteAction(rawCode: string): Promise<InviteActionResult> {
  try {
    const trimmed = rawCode?.trim();
    if (!trimmed || trimmed.length < 16) {
      return { success: false, error: "رمز الدعوة غير صالح." };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "يجب تسجيل الدخول أو إنشاء حساب أولاً للانضمام إلى القصة.",
      };
    }

    // Hash the raw code to match against database
    const codeHash = await hashInviteCode(trimmed);

    // Call atomic SECURITY DEFINER function in PostgreSQL
    const { data, error } = await supabase.rpc("accept_book_invite", {
      p_code_hash: codeHash,
    });

    if (error) {
      console.error("Error accepting invite:", error);
      return {
        success: false,
        error: error.message || "فشل قبول الدعوة. قد تكون منتهية الصلاحية أو تم استخدامها بالفعل.",
      };
    }

    const result = data as { success: boolean; book_id: string; book_name?: string };

    revalidatePath("/");
    revalidatePath(`/book/${result.book_id}`);

    return {
      success: true,
      bookId: result.book_id,
    };
  } catch (err) {
    console.error("Unexpected error in acceptPartnerInviteAction:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء معالجة الدعوة." };
  }
}

export async function revokeInviteAction(inviteId: string, bookId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("invites")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", inviteId);

    if (error) {
      return { success: false, error: "فشل إلغاء الدعوة." };
    }

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch {
    return { success: false, error: "حدث خطأ أثناء إلغاء الدعوة." };
  }
}
