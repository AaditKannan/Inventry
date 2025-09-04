-- Temporary fix: Add missing INSERT policy for profiles table
-- Run this in Supabase SQL Editor

-- Add the missing INSERT policy
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: temporarily disable RLS (ONLY FOR TESTING)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
