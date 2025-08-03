import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeaturedStoryResult {
  story_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  upload_date: string;
  tags: string[];
  views: number;
  slug: string;
}

export const useFeaturedStory = () => {
  const { user } = useAuth();

  const {
    data: featuredStory,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['featured-story', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_featured_story_for_user', {
        p_user_id: user?.id || null
      });

      if (error) {
        console.error('Error fetching featured story:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - featured story changes daily
    refetchOnWindowFocus: false,
    retry: 2
  });

  return {
    featuredStory: featuredStory ? {
      id: featuredStory.story_id,
      title: featuredStory.title,
      description: featuredStory.description,
      thumbnailUrl: featuredStory.thumbnail_url,
      videoUrl: featuredStory.video_url,
      duration: featuredStory.duration,
      uploadDate: featuredStory.upload_date,
      tags: featuredStory.tags,
      views: featuredStory.views,
      slug: featuredStory.slug
    } : null,
    loading: isLoading,
    error,
    refetch
  };
};