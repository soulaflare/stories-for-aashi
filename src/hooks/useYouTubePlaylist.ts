import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Story } from '@/types/story';
import { youtubeService } from '@/services/youtube';

export const useYouTubePlaylist = () => {
  const {
    data: stories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['youtube-playlist'],
    queryFn: () => youtubeService.fetchPlaylistVideos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  const {
    data: featuredStory,
    isLoading: featuredLoading
  } = useQuery({
    queryKey: ['featured-story'],
    queryFn: () => youtubeService.getFeaturedStory(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: stories.length > 0
  });

  const getRandomStory = async (): Promise<Story | null> => {
    return youtubeService.getRandomStory();
  };

  return {
    stories,
    featuredStory,
    loading: isLoading,
    featuredLoading,
    error,
    refetch,
    getRandomStory
  };
};