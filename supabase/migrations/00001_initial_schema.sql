-- ==============================================================================
-- Our Story Book (كتاب قصتنا) - Initial Database Schema & Security Policies
-- Phase 1: Profiles, Books, Book Members, Invites, RLS & Atomic Procedures
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (الملفات الشخصية)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2 AND char_length(display_name) <= 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS 'الملفات الشخصية للمستخدمين المرتبطة بنظام المصادقة';

-- ------------------------------------------------------------------------------
-- 2. Books Table (الكتب)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 100),
    partner1_name TEXT NOT NULL CHECK (char_length(trim(partner1_name)) >= 1 AND char_length(partner1_name) <= 50),
    partner2_name TEXT NOT NULL CHECK (char_length(trim(partner2_name)) >= 1 AND char_length(partner2_name) <= 50),
    story_start_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_books_created_by ON public.books(created_by);

COMMENT ON TABLE public.books IS 'دفاتر وقصص الذكريات المشتركة';

-- ------------------------------------------------------------------------------
-- 3. Book Members Table (أعضاء الكتاب - بحد أقصى عضوين)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_members (
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('creator', 'partner')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_book_members_user_id ON public.book_members(user_id);
CREATE INDEX IF NOT EXISTS idx_book_members_book_id ON public.book_members(book_id);

COMMENT ON TABLE public.book_members IS 'عضوية الكتاب - محددة بشخصين فقط';

-- Strict enforcement: Prevent more than 2 members per book at database level
CREATE OR REPLACE FUNCTION public.check_book_members_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_member_count INT;
BEGIN
    SELECT COUNT(*) INTO v_member_count
    FROM public.book_members
    WHERE book_id = NEW.book_id;

    IF v_member_count >= 2 THEN
        RAISE EXCEPTION 'لا يمكن إضافة أكثر من شريكين إلى هذا الكتاب (الحد الأقصى هو عضوين).';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_book_members_limit ON public.book_members;
CREATE TRIGGER trg_check_book_members_limit
    BEFORE INSERT ON public.book_members
    FOR EACH ROW
    EXECUTE FUNCTION public.check_book_members_limit();

-- ------------------------------------------------------------------------------
-- 4. Invites Table (دعوات الشريك الآمنة)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invites_book_id ON public.invites(book_id);
CREATE INDEX IF NOT EXISTS idx_invites_code_hash ON public.invites(code_hash);

COMMENT ON TABLE public.invites IS 'دعوات الشريك المنشأة والمحمية بواسطة تجزئة التشفير SHA-256';

-- ------------------------------------------------------------------------------
-- 5. Helper & Security Functions
-- ------------------------------------------------------------------------------

-- Helper: Check if auth user is a member of a given book
CREATE OR REPLACE FUNCTION public.is_book_member(p_book_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.book_members 
        WHERE book_id = p_book_id 
          AND user_id = auth.uid()
    );
$$;

-- Trigger: Automatically create public.profiles record when new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''), 'مستخدم جديد'),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Atomic Function: Create book and assign creator membership in a single transaction
CREATE OR REPLACE FUNCTION public.create_book_with_creator(
    p_name TEXT,
    p_partner1_name TEXT,
    p_partner2_name TEXT,
    p_story_start_date DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_book_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'يجب تسجيل الدخول لإنشاء كتاب.';
    END IF;

    -- Validate input lengths
    IF char_length(trim(p_name)) < 2 OR char_length(trim(p_name)) > 100 THEN
        RAISE EXCEPTION 'اسم الكتاب يجب أن يكون بين حرفين و100 حرف.';
    END IF;
    IF char_length(trim(p_partner1_name)) < 1 OR char_length(trim(p_partner1_name)) > 50 THEN
        RAISE EXCEPTION 'اسم الشريك الأول غير صالح.';
    END IF;
    IF char_length(trim(p_partner2_name)) < 1 OR char_length(trim(p_partner2_name)) > 50 THEN
        RAISE EXCEPTION 'اسم الشريك الثاني غير صالح.';
    END IF;

    -- Insert book
    INSERT INTO public.books (
        name,
        partner1_name,
        partner2_name,
        story_start_date,
        created_by
    ) VALUES (
        trim(p_name),
        trim(p_partner1_name),
        trim(p_partner2_name),
        p_story_start_date,
        v_user_id
    ) RETURNING id INTO v_book_id;

    -- Insert creator member
    INSERT INTO public.book_members (
        book_id,
        user_id,
        role,
        joined_at
    ) VALUES (
        v_book_id,
        v_user_id,
        'creator',
        now()
    );

    RETURN v_book_id;
END;
$$;

-- Atomic Function: Accept invite safely and atomically
CREATE OR REPLACE FUNCTION public.accept_book_invite(
    p_code_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_invite RECORD;
    v_member_count INT;
    v_book RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'يجب تسجيل الدخول أولاً لقبول الدعوة.';
    END IF;

    -- Find and lock invite row to prevent race conditions
    SELECT * INTO v_invite
    FROM public.invites
    WHERE code_hash = p_code_hash
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'رمز الدعوة غير صالح أو غير موجود.';
    END IF;

    IF v_invite.used_at IS NOT NULL THEN
        RAISE EXCEPTION 'تم استخدام رمز الدعوة هذا مسبقاً.';
    END IF;

    IF v_invite.revoked_at IS NOT NULL THEN
        RAISE EXCEPTION 'تم إلغاء هذه الدعوة من قبل الشريك.';
    END IF;

    IF v_invite.expires_at <= now() THEN
        RAISE EXCEPTION 'انتهت صلاحية هذه الدعوة.';
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.book_members 
        WHERE book_id = v_invite.book_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'أنت عضو بالفعل في هذا الكتاب.';
    END IF;

    -- Check member limit with row locking on book members
    SELECT COUNT(*) INTO v_member_count
    FROM public.book_members
    WHERE book_id = v_invite.book_id;

    IF v_member_count >= 2 THEN
        RAISE EXCEPTION 'اكتمل عدد أعضاء هذا الكتاب بالفعل (عضوان كحد أقصى).';
    END IF;

    -- Mark invite as used
    UPDATE public.invites
    SET used_at = now(),
        used_by = v_user_id
    WHERE id = v_invite.id;

    -- Add member
    INSERT INTO public.book_members (
        book_id,
        user_id,
        role,
        joined_at
    ) VALUES (
        v_invite.book_id,
        v_user_id,
        'partner',
        now()
    );

    -- Fetch book details for confirmation
    SELECT id, name, partner1_name, partner2_name INTO v_book
    FROM public.books
    WHERE id = v_invite.book_id;

    RETURN jsonb_build_object(
        'success', true,
        'book_id', v_book.id,
        'book_name', v_book.name
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or partner profiles" ON public.profiles;
CREATE POLICY "Users can view own profile or partner profiles"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.book_members bm1
            JOIN public.book_members bm2 ON bm1.book_id = bm2.book_id
            WHERE bm1.user_id = auth.uid() AND bm2.user_id = public.profiles.id
        )
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Books Policies
DROP POLICY IF EXISTS "Members can view their books" ON public.books;
CREATE POLICY "Members can view their books"
    ON public.books FOR SELECT
    USING (public.is_book_member(id));

DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
CREATE POLICY "Authenticated users can insert books"
    ON public.books FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "Members can update their books" ON public.books;
CREATE POLICY "Members can update their books"
    ON public.books FOR UPDATE
    USING (public.is_book_member(id))
    WITH CHECK (public.is_book_member(id));

DROP POLICY IF EXISTS "Creator can delete their books" ON public.books;
CREATE POLICY "Creator can delete their books"
    ON public.books FOR DELETE
    USING (created_by = auth.uid());

-- Book Members Policies
DROP POLICY IF EXISTS "Members can view members of their books" ON public.book_members;
CREATE POLICY "Members can view members of their books"
    ON public.book_members FOR SELECT
    USING (public.is_book_member(book_id));

DROP POLICY IF EXISTS "Creator can insert initial membership" ON public.book_members;
CREATE POLICY "Creator can insert initial membership"
    ON public.book_members FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.books
            WHERE id = book_id AND created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Members can leave book" ON public.book_members;
CREATE POLICY "Members can leave book"
    ON public.book_members FOR DELETE
    USING (user_id = auth.uid());

-- Invites Policies
DROP POLICY IF EXISTS "Members can view book invites" ON public.invites;
CREATE POLICY "Members can view book invites"
    ON public.invites FOR SELECT
    USING (public.is_book_member(book_id));

DROP POLICY IF EXISTS "Members can insert invites if book not full" ON public.invites;
CREATE POLICY "Members can insert invites if book not full"
    ON public.invites FOR INSERT
    WITH CHECK (
        public.is_book_member(book_id) AND
        created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Members can revoke invites" ON public.invites;
CREATE POLICY "Members can revoke invites"
    ON public.invites FOR UPDATE
    USING (public.is_book_member(book_id))
    WITH CHECK (public.is_book_member(book_id));
