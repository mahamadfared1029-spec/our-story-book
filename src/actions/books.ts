"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateBookInput } from "@/lib/validations";
import type { Book, BookWithMembers, Profile } from "@/lib/types/database";

export interface BookActionState {
  error?: string | null;
  success?: boolean;
  bookId?: string | null;
}

export async function createBookAction(
  prevState: BookActionState | null,
  formData: FormData
): Promise<BookActionState> {
  const name = formData.get("name") as string;
  const partner1_name = formData.get("partner1_name") as string;
  const partner2_name = formData.get("partner2_name") as string;
  const story_start_date = formData.get("story_start_date") as string;

  const validation = validateBookInput({
    name,
    partner1_name,
    partner2_name,
    story_start_date,
  });

  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "يجب تسجيل الدخول أولاً لإنشاء كتاب." };
  }

  // Use the atomic database function create_book_with_creator
  // This guarantees that both the book and creator's membership are inserted together
  const { data: bookId, error } = await supabase.rpc("create_book_with_creator", {
    p_name: validation.data!.name,
    p_partner1_name: validation.data!.partner1_name,
    p_partner2_name: validation.data!.partner2_name,
    p_story_start_date: validation.data!.story_start_date,
  });

  if (error) {
    console.error("Error creating book:", error);
    return { error: error.message || "حدث خطأ أثناء حفظ الكتاب في قاعدة البيانات." };
  }

  revalidatePath("/");
  redirect(`/book/${bookId}`);
}

export async function getUserBooks(): Promise<Book[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Query books where user is a member (RLS enforces that only member books are returned)
    const { data: books, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user books:", error);
      return [];
    }

    return (books as Book[]) || [];
  } catch (err) {
    console.error("Failed to load user books:", err);
    return [];
  }
}

export async function getBookDetails(bookId: string): Promise<BookWithMembers | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch the book (RLS ensures user is a member)
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      return null;
    }

    // Fetch members of this book
    const { data: members, error: membersError } = await supabase
      .from("book_members")
      .select("user_id, role, joined_at")
      .eq("book_id", bookId);

    if (membersError) {
      console.error("Error fetching book members:", membersError);
    }

    // Fetch member profiles
    const memberUserIds = (members || []).map((m) => m.user_id);
    let profilesMap: Record<string, Profile> = {};

    if (memberUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", memberUserIds);

      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.id] = p as Profile;
          return acc;
        }, {} as Record<string, Profile>);
      }
    }

    // Fetch active (unused and unexpired and not revoked) invite for this book
    const { data: invites } = await supabase
      .from("invites")
      .select("*")
      .eq("book_id", bookId)
      .is("used_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    const activeInvite = invites && invites.length > 0 ? invites[0] : null;

    const enrichedMembers = (members || []).map((m) => ({
      user_id: m.user_id,
      role: m.role as 'creator' | 'partner',
      joined_at: m.joined_at,
      profile: profilesMap[m.user_id] || null,
    }));

    return {
      ...(book as Book),
      members: enrichedMembers,
      activeInvite,
    };
  } catch (err) {
    console.error("Error getting book details:", err);
    return null;
  }
}
