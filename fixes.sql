-- ============================================
-- PUNTO ELECTRO - Database Fixes & Automation
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- TASK 1: Auto-create Profile on User Registration
-- ============================================

-- Function to copy user data to profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TASK 2: Storage Bucket for Images
-- ============================================

-- Note: Bucket creation via SQL is limited. 
-- Use Supabase Dashboard or this insert if bucket doesn't exist:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Policy: Allow public read access to all images
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own uploaded images
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.uid() = owner
);

-- Policy: Users can delete their own uploaded images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid() = owner
);

-- ============================================
-- ADDITIONAL FIXES: Table name compatibility
-- ============================================

-- Create views for backward compatibility if tables have ele_ prefix
-- (Run only if you have ele_ prefixed tables and want to access them without prefix)

-- If your actual tables are named with ele_ prefix, uncomment these:
/*
CREATE OR REPLACE VIEW project_lists AS SELECT * FROM ele_project_lists;
CREATE OR REPLACE VIEW project_list_items AS SELECT * FROM ele_project_list_items;
*/

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Ensure the trigger function can be executed
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to profiles table
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ============================================
-- TEST: Verify trigger works
-- ============================================

-- You can test by inserting a dummy user (don't run in production):
-- SELECT public.handle_new_user();

-- ============================================
-- END OF FIXES
-- ============================================
