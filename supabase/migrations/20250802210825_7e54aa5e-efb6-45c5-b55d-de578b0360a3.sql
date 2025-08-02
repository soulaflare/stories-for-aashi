-- Create stories table for persistent video storage
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration TEXT,
  upload_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  views INTEGER DEFAULT 0,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since stories are public content)
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories 
FOR SELECT 
USING (is_active = true);

-- Create policy for service role to manage stories (for sync operations)
CREATE POLICY "Service role can manage stories" 
ON public.stories 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create indexes for better performance
CREATE INDEX idx_stories_video_id ON public.stories(video_id);
CREATE INDEX idx_stories_slug ON public.stories(slug);
CREATE INDEX idx_stories_upload_date ON public.stories(upload_date DESC);
CREATE INDEX idx_stories_is_active ON public.stories(is_active);
CREATE INDEX idx_stories_tags ON public.stories USING GIN(tags);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^\w\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;