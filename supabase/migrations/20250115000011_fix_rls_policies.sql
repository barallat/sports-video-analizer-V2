-- Fix RLS policies to allow trigger insertions
-- This migration fixes the RLS policies to allow the trigger to insert user records

-- First, temporarily disable RLS on usuarios table to allow trigger insertions
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios;

-- Re-enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow trigger insertions
-- Policy for SELECT: users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.usuarios
FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy for UPDATE: users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.usuarios
FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy for INSERT: allow system to insert (for triggers)
-- This policy allows inserts when the current user is the same as the auth_user_id being inserted
-- or when there's no current user (system/trigger context)
CREATE POLICY "System can insert user records" ON public.usuarios
FOR INSERT WITH CHECK (
  auth.uid() = auth_user_id OR 
  auth.uid() IS NULL
);

-- Also create a policy for service role to insert users
-- This allows the trigger to work even when called by the system
CREATE POLICY "Service role can insert users" ON public.usuarios
FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to the service role
GRANT INSERT ON public.usuarios TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
