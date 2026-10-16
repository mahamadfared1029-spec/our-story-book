-- ==============================================================================
-- Our Story Book (كتاب قصتنا) - Phase 3 Schema Migration
-- Timeline & Milestones Enhancement
-- ==============================================================================

-- 1. Add milestone and memory metadata columns to chapters
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS milestone_type TEXT,
ADD COLUMN IF NOT EXISTS mood_tag TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Constraint for milestone_type values
ALTER TABLE public.chapters
DROP CONSTRAINT IF EXISTS chk_chapters_milestone_type;

ALTER TABLE public.chapters
ADD CONSTRAINT chk_chapters_milestone_type
CHECK (
    milestone_type IS NULL OR
    milestone_type IN (
        'first_meet',
        'proposal',
        'engagement',
        'wedding',
        'trip',
        'anniversary',
        'new_home',
        'special_moment',
        'other'
    )
);

-- 3. Constraint for mood_tag values
ALTER TABLE public.chapters
DROP CONSTRAINT IF EXISTS chk_chapters_mood_tag;

ALTER TABLE public.chapters
ADD CONSTRAINT chk_chapters_mood_tag
CHECK (
    mood_tag IS NULL OR
    mood_tag IN (
        'romantic',
        'joyful',
        'funny',
        'nostalgic',
        'cozy',
        'peaceful',
        'special'
    )
);

-- 4. Constraint for location length
ALTER TABLE public.chapters
DROP CONSTRAINT IF EXISTS chk_chapters_location_len;

ALTER TABLE public.chapters
ADD CONSTRAINT chk_chapters_location_len
CHECK (
    location IS NULL OR
    char_length(location) <= 100
);

-- 5. Indexes for timeline performance
CREATE INDEX IF NOT EXISTS idx_chapters_is_milestone ON public.chapters(is_milestone);
CREATE INDEX IF NOT EXISTS idx_chapters_timeline_sort ON public.chapters(book_id, event_date ASC);

COMMENT ON COLUMN public.chapters.is_milestone IS 'هل الفصل يعتبر علامة فارقة أو محطة رئيسية في قصة الشريكين';
COMMENT ON COLUMN public.chapters.milestone_type IS 'نوع المحطة الرئيسية (أول لقاء، خطوبة، زواج، سفر، إلخ)';
COMMENT ON COLUMN public.chapters.mood_tag IS 'طابع أو شعور الذكرى (رومانسي، بهيج، مضحك، دافئ، إلخ)';
COMMENT ON COLUMN public.chapters.location IS 'المكان أو المدينة التي حدثت فيها الذكرى';
