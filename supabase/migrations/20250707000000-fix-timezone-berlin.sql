-- Fix timezone configuration to Berlin time (CET/CEST)
-- This ensures all timestamps are stored and displayed in Berlin local time

-- Set database default timezone to Europe/Berlin
ALTER DATABASE postgres SET timezone = 'Europe/Berlin';

-- Update existing timestamp columns to use Berlin timezone as default
-- This affects new inserts going forward
ALTER TABLE public.feedback_ratings 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin');

ALTER TABLE public.profiles 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin'),
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin');

ALTER TABLE public.user_progress 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin'),
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin');

ALTER TABLE public.user_study_data 
ALTER COLUMN consent_timestamp SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin'),
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin'),
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'Europe/Berlin');

-- Create a function to ensure Berlin timezone for all timestamp operations
CREATE OR REPLACE FUNCTION berlin_now()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
AS $$
  SELECT now() AT TIME ZONE 'Europe/Berlin';
$$;

-- Add comment for documentation
COMMENT ON FUNCTION berlin_now() IS 'Returns current timestamp in Berlin timezone (CET/CEST)';
