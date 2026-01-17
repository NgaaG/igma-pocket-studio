-- Create profiles table for user data from Figma OAuth
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    figma_id TEXT UNIQUE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create figma_tokens table for storing OAuth tokens securely
CREATE TABLE public.figma_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create cached_files table for storing user's recent/bookmarked files
CREATE TABLE public.cached_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    figma_file_key TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT DEFAULT 'design',
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_bookmarked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, figma_file_key)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figma_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_files ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns their profile
CREATE OR REPLACE FUNCTION public.is_own_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid() = profile_id
$$;

-- Helper function to check if user owns a token record
CREATE OR REPLACE FUNCTION public.owns_token(token_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid() = token_user_id
$$;

-- Helper function to check if user owns a cached file
CREATE OR REPLACE FUNCTION public.owns_cached_file(file_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.uid() = file_user_id
$$;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (public.is_own_profile(id));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (public.is_own_profile(id));

-- RLS policies for figma_tokens (tokens should NEVER be exposed to client)
-- Only service role can access tokens, not authenticated users directly
CREATE POLICY "No direct token access"
ON public.figma_tokens FOR SELECT
USING (false);

CREATE POLICY "No direct token insert"
ON public.figma_tokens FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct token update"
ON public.figma_tokens FOR UPDATE
USING (false);

-- RLS policies for cached_files
CREATE POLICY "Users can view their own cached files"
ON public.cached_files FOR SELECT
USING (public.owns_cached_file(user_id));

CREATE POLICY "Users can insert their own cached files"
ON public.cached_files FOR INSERT
WITH CHECK (public.owns_cached_file(user_id));

CREATE POLICY "Users can update their own cached files"
ON public.cached_files FOR UPDATE
USING (public.owns_cached_file(user_id));

CREATE POLICY "Users can delete their own cached files"
ON public.cached_files FOR DELETE
USING (public.owns_cached_file(user_id));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_figma_tokens_updated_at
    BEFORE UPDATE ON public.figma_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();