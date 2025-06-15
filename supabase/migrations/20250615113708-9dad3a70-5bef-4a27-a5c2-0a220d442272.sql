
-- Create a table to store user feedback ratings
CREATE TABLE IF NOT EXISTS public.feedback_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('graph', 'graphrag')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  item_id TEXT,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own ratings
ALTER TABLE public.feedback_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own ratings
CREATE POLICY "Users can view their own feedback ratings" 
  ON public.feedback_ratings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own ratings
CREATE POLICY "Users can create their own feedback ratings" 
  ON public.feedback_ratings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own ratings
CREATE POLICY "Users can update their own feedback ratings" 
  ON public.feedback_ratings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own ratings
CREATE POLICY "Users can delete their own feedback ratings" 
  ON public.feedback_ratings 
  FOR DELETE 
  USING (auth.uid() = user_id);
