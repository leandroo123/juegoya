-- Migration: Add gender and match_type fields
-- Run this in Supabase SQL Editor

-- Add gender column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro'));

-- Add match_type column to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS match_type TEXT CHECK (match_type IN ('Solo Mujeres', 'Solo Hombres', 'Mixto'));

-- Add comments for clarity
COMMENT ON COLUMN profiles.gender IS 'User gender: Masculino, Femenino, or Otro';
COMMENT ON COLUMN matches.match_type IS 'Match type: Solo Mujeres, Solo Hombres, or Mixto';
