"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateDisplayName, validateEmail, validatePassword } from "@/lib/validations";

export interface AuthState {
  error?: string | null;
  success?: string | null;
}

export async function signUpAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  const emailVal = validateEmail(email);
  if (!emailVal.success) {
    return { error: emailVal.error };
  }

  const passVal = validatePassword(password);
  if (!passVal.success) {
    return { error: passVal.error };
  }

  const nameVal = validateDisplayName(displayName);
  if (!nameVal.success) {
    return { error: nameVal.error };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: emailVal.data!,
    password: passVal.data!,
    options: {
      data: {
        display_name: nameVal.data!,
      },
    },
  });

  if (error) {
    // Return friendly, safe Arabic error messages
    if (error.message.includes("User already registered") || error.message.includes("already exists")) {
      return { error: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول." };
    }
    return { error: error.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى." };
  }

  // If Supabase has email confirmation enabled
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "هذا البريد الإلكتروني مسجل بالفعل." };
  }

  // If email confirmation is required:
  if (data.session === null) {
    return {
      success: "تم إنشاء حسابك بنجاح! إذا كانت ميزة تأكيد البريد مفعلة، يرجى مراجعة بريدك الإلكتروني.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailVal = validateEmail(email);
  if (!emailVal.success) {
    return { error: emailVal.error };
  }

  if (!password) {
    return { error: "يرجى إدخال كلمة المرور." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: emailVal.data!,
    password: password,
  });

  if (error) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      user,
      profile: profile || {
        id: user.id,
        display_name: user.user_metadata?.display_name || "مستخدم",
        created_at: user.created_at,
        updated_at: user.created_at,
      },
    };
  } catch {
    return null;
  }
}
