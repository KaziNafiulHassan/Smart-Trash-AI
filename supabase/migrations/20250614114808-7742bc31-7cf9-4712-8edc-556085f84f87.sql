
-- Add new columns to the profiles table for study data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_usage_approved BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false;

-- Create a new table for detailed user study data
CREATE TABLE IF NOT EXISTS public.user_study_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  nationality TEXT,
  data_usage_approved BOOLEAN NOT NULL DEFAULT false,
  additional_notes TEXT,
  consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add proper foreign key constraints to existing tables (without IF NOT EXISTS)
DO $$ 
BEGIN
    -- Add foreign key for game_sessions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_game_sessions_user_id'
    ) THEN
        ALTER TABLE public.game_sessions 
        ADD CONSTRAINT fk_game_sessions_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for user_achievements user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_achievements_user_id'
    ) THEN
        ALTER TABLE public.user_achievements 
        ADD CONSTRAINT fk_user_achievements_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for user_achievements achievement_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_achievements_achievement_id'
    ) THEN
        ALTER TABLE public.user_achievements 
        ADD CONSTRAINT fk_user_achievements_achievement_id 
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for user_progress if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_progress_user_id'
    ) THEN
        ALTER TABLE public.user_progress 
        ADD CONSTRAINT fk_user_progress_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for image_classifications if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_image_classifications_user_id'
    ) THEN
        ALTER TABLE public.image_classifications 
        ADD CONSTRAINT fk_image_classifications_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for waste_items if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_waste_items_category_id'
    ) THEN
        ALTER TABLE public.waste_items 
        ADD CONSTRAINT fk_waste_items_category_id 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update the handle_new_user function to handle the new registration flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles table with registration_completed = false initially
  INSERT INTO public.profiles (id, name, language, registration_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Player'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'language' = 'DE' THEN 'DE'::user_language
      ELSE 'EN'::user_language
    END,
    false
  );
  
  -- Insert into user_progress table
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create function to complete user registration
CREATE OR REPLACE FUNCTION public.complete_user_registration(
  p_user_id UUID,
  p_name TEXT,
  p_age INTEGER,
  p_gender TEXT,
  p_nationality TEXT,
  p_data_usage_approved BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update profiles table
  UPDATE public.profiles 
  SET 
    name = p_name,
    age = p_age,
    gender = p_gender,
    nationality = p_nationality,
    data_usage_approved = p_data_usage_approved,
    registration_completed = true,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Insert into user_study_data table
  INSERT INTO public.user_study_data (
    user_id,
    age,
    gender,
    nationality,
    data_usage_approved
  ) VALUES (
    p_user_id,
    p_age,
    p_gender,
    p_nationality,
    p_data_usage_approved
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    age = EXCLUDED.age,
    gender = EXCLUDED.gender,
    nationality = EXCLUDED.nationality,
    data_usage_approved = EXCLUDED.data_usage_approved,
    updated_at = now();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in complete_user_registration: %', SQLERRM;
    RETURN false;
END;
$function$;
