import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useWatchHistory = () => {
  const { user } = useAuth();
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
    } else {
      setWatchedVideoIds(new Set());
    }
  }, [user]);

  const fetchWatchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watched_videos')
        .select('video_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const videoIds = new Set(data?.map(item => item.video_id) || []);
      setWatchedVideoIds(videoIds);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsWatched = async (videoId: string, videoTitle?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watched_videos')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          video_title: videoTitle
        });

      if (error) throw error;

      setWatchedVideoIds(prev => new Set([...prev, videoId]));
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const isWatched = (videoId: string) => watchedVideoIds.has(videoId);

  return {
    watchedVideoIds,
    loading,
    markAsWatched,
    isWatched,
    refetch: fetchWatchHistory
  };
};