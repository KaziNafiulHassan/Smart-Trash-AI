-- Add username-based authentication system
-- This migration adds username support while maintaining backward compatibility

-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username is lowercase and alphanumeric with underscores
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$' AND length(username) >= 3 AND length(username) <= 30);

-- Create a function to generate username from email for existing users
CREATE OR REPLACE FUNCTION generate_username_from_email(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 1;
BEGIN
    -- Extract username part from email and clean it
    base_username := lower(regexp_replace(split_part(email_address, '@', 1), '[^a-z0-9]', '_', 'g'));
    
    -- Ensure minimum length
    IF length(base_username) < 3 THEN
        base_username := base_username || '_user';
    END IF;
    
    -- Ensure maximum length
    IF length(base_username) > 25 THEN
        base_username := left(base_username, 25);
    END IF;
    
    final_username := base_username;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || '_' || counter;
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > 999 THEN
            final_username := base_username || '_' || extract(epoch from now())::integer;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_username;
END;
$$;

-- Update existing users with generated usernames based on their email
DO $$
DECLARE
    user_record RECORD;
    generated_username TEXT;
BEGIN
    FOR user_record IN 
        SELECT p.id, au.email 
        FROM public.profiles p 
        JOIN auth.users au ON p.id = au.id 
        WHERE p.username IS NULL
    LOOP
        generated_username := generate_username_from_email(user_record.email);
        
        UPDATE public.profiles 
        SET username = generated_username 
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Generated username % for user %', generated_username, user_record.id;
    END LOOP;
END;
$$;

-- Make username required after populating existing users
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Create a function to handle username-based user lookup
CREATE OR REPLACE FUNCTION get_user_by_username(input_username TEXT)
RETURNS TABLE(user_id UUID, name TEXT, language user_language)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.language
    FROM public.profiles p
    WHERE p.username = lower(input_username);
END;
$$;

-- Update RLS policies to work with username-based auth
-- Note: The existing policies based on auth.uid() will continue to work
-- as they rely on the authenticated user's ID, not email

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for barrier-free authentication (3-30 chars, lowercase alphanumeric with underscores)';
COMMENT ON FUNCTION get_user_by_username(TEXT) IS 'Lookup user by username for authentication purposes';
COMMENT ON FUNCTION generate_username_from_email(TEXT) IS 'Generate unique username from email address for existing users';
