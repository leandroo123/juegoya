-- Migration: 004_mvp_enhancements.sql

-- 1. Alter profiles table to support new sport levels
ALTER TABLE profiles DROP COLUMN IF EXISTS padel_level;

-- Add padel_category (text, e.g. '1ra', '2da')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS padel_category text;
ALTER TABLE profiles ADD CONSTRAINT padel_category_check CHECK (padel_category IN ('1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'));

-- Add tennis_level (int 1-5)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tennis_level int CHECK (tennis_level BETWEEN 1 AND 5);

-- 2. RLS Policy: Allow authenticated users to view all profiles 
-- (Necessary for Player Profile View to show WhatsApp)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can see all profiles" ON profiles;

CREATE POLICY "Authenticated users can see all profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Ensure profiles are still updateable by self
-- (Assuming existing policy "Users can insert their own profile" and "Users can update own profile" exists)
