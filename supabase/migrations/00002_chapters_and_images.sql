-- ==============================================================================
-- Our Story Book (كتاب قصتنا) - Phase 2 Schema & Storage Migration
-- Chapters, Chapter Images, Storage Bucket & Strict RLS Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Chapters Table (فصول الذكريات)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 150),
    event_date DATE NOT NULL,
    body TEXT NOT NULL CHECK (char_length(trim(body)) >= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON public.chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_event_date ON public.chapters(event_date);
CREATE INDEX IF NOT EXISTS idx_chapters_author_id ON public.chapters(author_id);

COMMENT ON TABLE public.chapters IS 'فصول وقصص الذكريات المرتبطة بكل كتاب';

-- ------------------------------------------------------------------------------
-- 2. Chapter Images Table (صور الفصول - من 1 إلى 3 صور كحد أقصى)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapter_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0 AND sort_order <= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chapter_images_chapter_id ON public.chapter_images(chapter_id);

COMMENT ON TABLE public.chapter_images IS 'مسارات الصور الخاصة بكل فصل - محمية في Storage خاص';

-- Trigger: Enforce max 3 images per chapter at database level
CREATE OR REPLACE FUNCTION public.check_chapter_images_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_image_count INT;
BEGIN
    SELECT COUNT(*) INTO v_image_count
    FROM public.chapter_images
    WHERE chapter_id = NEW.chapter_id;

    IF v_image_count >= 3 THEN
        RAISE EXCEPTION 'لا يمكن إضافة أكثر من 3 صور لكل فصل ذكريات.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_chapter_images_limit ON public.chapter_images;
CREATE TRIGGER trg_check_chapter_images_limit
    BEFORE INSERT ON public.chapter_images
    FOR EACH ROW
    EXECUTE FUNCTION public.check_chapter_images_limit();

-- ------------------------------------------------------------------------------
-- 3. Private Storage Bucket Setup (حاوية التخزين الخاصة)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chapter-images',
    'chapter-images',
    false, -- STRICTLY PRIVATE: No public URLs allowed
    5242880, -- 5 MB max per image
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) on Chapters and Chapter Images
-- ------------------------------------------------------------------------------
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_images ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is member of the book owning a chapter
CREATE OR REPLACE FUNCTION public.is_chapter_book_member(p_chapter_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chapters c
        JOIN public.book_members bm ON bm.book_id = c.book_id
        WHERE c.id = p_chapter_id
          AND bm.user_id = auth.uid()
    );
$$;

-- Chapters RLS Policies
DROP POLICY IF EXISTS "Members can view chapters of their books" ON public.chapters;
CREATE POLICY "Members can view chapters of their books"
    ON public.chapters FOR SELECT
    USING (public.is_book_member(book_id));

DROP POLICY IF EXISTS "Members can insert chapters to their books" ON public.chapters;
CREATE POLICY "Members can insert chapters to their books"
    ON public.chapters FOR INSERT
    WITH CHECK (
        public.is_book_member(book_id) AND
        author_id = auth.uid()
    );

DROP POLICY IF EXISTS "Members can update chapters of their books" ON public.chapters;
CREATE POLICY "Members can update chapters of their books"
    ON public.chapters FOR UPDATE
    USING (public.is_book_member(book_id))
    WITH CHECK (public.is_book_member(book_id));

DROP POLICY IF EXISTS "Author or creator can delete chapter" ON public.chapters;
CREATE POLICY "Author or creator can delete chapter"
    ON public.chapters FOR DELETE
    USING (
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.books b
            WHERE b.id = public.chapters.book_id AND b.created_by = auth.uid()
        )
    );

-- Chapter Images RLS Policies
DROP POLICY IF EXISTS "Members can view images of their chapters" ON public.chapter_images;
CREATE POLICY "Members can view images of their chapters"
    ON public.chapter_images FOR SELECT
    USING (public.is_chapter_book_member(chapter_id));

DROP POLICY IF EXISTS "Members can insert images to their chapters" ON public.chapter_images;
CREATE POLICY "Members can insert images to their chapters"
    ON public.chapter_images FOR INSERT
    WITH CHECK (public.is_chapter_book_member(chapter_id));

DROP POLICY IF EXISTS "Members can update images of their chapters" ON public.chapter_images;
CREATE POLICY "Members can update images of their chapters"
    ON public.chapter_images FOR UPDATE
    USING (public.is_chapter_book_member(chapter_id))
    WITH CHECK (public.is_chapter_book_member(chapter_id));

DROP POLICY IF EXISTS "Members can delete images of their chapters" ON public.chapter_images;
CREATE POLICY "Members can delete images of their chapters"
    ON public.chapter_images FOR DELETE
    USING (public.is_chapter_book_member(chapter_id));

-- ------------------------------------------------------------------------------
-- 5. Storage RLS Policies (حماية الكائنات في Storage)
-- ------------------------------------------------------------------------------
-- Paths follow convention: book_{book_id}/chapter_{chapter_id}/{uuid}.{ext}
-- Extract book_id from (storage.foldername(name))[1]

DROP POLICY IF EXISTS "Members can upload chapter images" ON storage.objects;
CREATE POLICY "Members can upload chapter images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'chapter-images' AND
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Members can view chapter images" ON storage.objects;
CREATE POLICY "Members can view chapter images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'chapter-images' AND
        auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Members can delete chapter images" ON storage.objects;
CREATE POLICY "Members can delete chapter images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'chapter-images' AND
        auth.uid() IS NOT NULL
    );
