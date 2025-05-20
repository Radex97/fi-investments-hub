
-- Create a table for storing legitimation photos
CREATE TABLE public.legitimation_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('front', 'back', 'selfie')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.legitimation_photos ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to select their own photos
CREATE POLICY "Users can view their own legitimation photos" 
  ON public.legitimation_photos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy allowing users to insert their own photos
CREATE POLICY "Users can upload their own legitimation photos" 
  ON public.legitimation_photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy allowing admins to view all photos
CREATE POLICY "Admins can view all legitimation photos" 
  ON public.legitimation_photos 
  FOR SELECT 
  USING (public.is_admin());
