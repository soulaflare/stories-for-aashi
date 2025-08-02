import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/story';

interface StoriesHookResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  forceSync: () => Promise<void>;
}

export function useStories(): StoriesHookResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get stories from database
      const { data: dbStories, error: dbError } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('upload_date', { ascending: false });

      if (dbError) {
        console.error('Database fetch error:', dbError);
        // Fallback to edge function sync
        await syncWithYouTube();
        return;
      }

      if (dbStories && dbStories.length > 0) {
        // Transform database stories to Story format
        const transformedStories: Story[] = dbStories.map(story => ({
          id: story.video_id,
          title: story.title,
          description: story.description,
          thumbnailUrl: story.thumbnail_url,
          videoUrl: story.video_url,
          duration: story.duration,
          uploadDate: story.upload_date,
          tags: story.tags,
          views: story.views,
          slug: story.slug
        }));
        
        setStories(transformedStories);
      } else {
        // No stories in database, trigger sync
        await syncWithYouTube();
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to fetch stories');
      // Try fallback sync
      await syncWithYouTube();
    } finally {
      setLoading(false);
    }
  };

  const syncWithYouTube = async () => {
    try {
      console.log('Triggering YouTube sync...');
      
      const { data, error: syncError } = await supabase.functions.invoke('fetch-youtube-playlist');
      
      if (syncError) {
        console.error('Sync error:', syncError);
        throw new Error('Failed to sync with YouTube');
      }

      if (data?.stories) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('YouTube sync failed:', err);
      setError('Failed to sync with YouTube');
      // Set empty array as fallback
      setStories([]);
    }
  };

  const refetch = async () => {
    await fetchStories();
  };

  const forceSync = async () => {
    setLoading(true);
    await syncWithYouTube();
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return { stories, loading, error, refetch, forceSync };
}

export function useStoryBySlug(slug: string): { story: Story | null; loading: boolean; error: string | null } {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: dbStory, error: dbError } = await supabase
          .from('stories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (dbError || !dbStory) {
          console.error('Story not found or inactive:', dbError);
          setError('Story not found');
          setStory(null);
        } else {
          const transformedStory: Story = {
            id: dbStory.video_id,
            title: dbStory.title,
            description: dbStory.description,
            thumbnailUrl: dbStory.thumbnail_url,
            videoUrl: dbStory.video_url,
            duration: dbStory.duration,
            uploadDate: dbStory.upload_date,
            tags: dbStory.tags,
            views: dbStory.views,
            slug: dbStory.slug
          };
          setStory(transformedStory);
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to fetch story');
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [slug]);

  return { story, loading, error };
}