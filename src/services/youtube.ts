import { Story, YouTubePlaylistResponse, YouTubeVideoItem } from '@/types/story';

// Fallback stories for when YouTube API is not available
const FALLBACK_STORIES: Story[] = [
  {
    id: '1',
    title: 'A Moment in Time',
    description: 'Sometimes the smallest moments create the most beautiful memories. This is one of those stories.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=640&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 'PT3M45S',
    uploadDate: '2024-01-15T10:30:00Z',
    tags: ['memory', 'moment', 'beautiful'],
    views: 1247
  },
  {
    id: '2',
    title: 'Dancing in the Rain',
    description: 'Life is not about waiting for the storm to pass, but learning to dance in the rain.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=640&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 'PT5M12S',
    uploadDate: '2024-01-10T14:22:00Z',
    tags: ['dance', 'rain', 'joy'],
    views: 2103
  },
  {
    id: '3',
    title: 'The Coffee Shop Chronicles',
    description: 'Every coffee shop has its stories. This is ours - a tale of chance encounters and serendipity.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 'PT4M33S',
    uploadDate: '2024-01-05T09:15:00Z',
    tags: ['coffee', 'story', 'serendipity'],
    views: 856
  },
  {
    id: '4',
    title: 'Sunset Conversations',
    description: 'The best conversations happen when the sun is setting and the world feels infinite.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 'PT6M18S',
    uploadDate: '2024-01-01T18:45:00Z',
    tags: ['sunset', 'conversation', 'infinite'],
    views: 1892
  }
];

// YouTube API configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const PLAYLIST_ID = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID || 'YOUR_PLAYLIST_ID';
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isValidApiKey(): boolean {
    return Boolean(YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'your_youtube_api_key_here');
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private transformYouTubeData(items: YouTubeVideoItem[]): Story[] {
    return items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnailUrl: item.snippet.thumbnails.maxres?.url || 
                   item.snippet.thumbnails.high?.url || 
                   item.snippet.thumbnails.medium.url,
      videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      duration: item.contentDetails?.duration || '',
      uploadDate: item.snippet.publishedAt,
      tags: this.extractTags(item.snippet.description || ''),
      views: Math.floor(Math.random() * 5000) + 100 // Placeholder as view count requires additional API call
    }));
  }

  private extractTags(description: string): string[] {
    const hashtags = description.match(/#[\w]+/g) || [];
    return hashtags.map(tag => tag.replace('#', '')).slice(0, 5);
  }

  async fetchPlaylistVideos(): Promise<Story[]> {
    // Check cache first
    const cached = this.getCachedData<Story[]>('playlist_videos');
    if (cached) {
      return cached;
    }

    // If no API key, return fallback stories
    if (!this.isValidApiKey()) {
      console.warn('YouTube API key not configured. Using fallback stories.');
      this.setCachedData('playlist_videos', FALLBACK_STORIES);
      return FALLBACK_STORIES;
    }

    try {
      // Fetch playlist items
      const playlistResponse = await fetch(
        `${API_BASE_URL}/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
      );

      if (!playlistResponse.ok) {
        throw new Error(`YouTube API error: ${playlistResponse.status}`);
      }

      const playlistData: YouTubePlaylistResponse = await playlistResponse.json();
      
      if (!playlistData.items || playlistData.items.length === 0) {
        console.warn('No videos found in playlist. Using fallback stories.');
        this.setCachedData('playlist_videos', FALLBACK_STORIES);
        return FALLBACK_STORIES;
      }

      // Fetch video details for duration
      const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);
      const videosResponse = await fetch(
        `${API_BASE_URL}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
      );

      const videosData = await videosResponse.json();
      
      // Merge playlist items with video details
      const enrichedItems = playlistData.items.map(item => ({
        ...item,
        contentDetails: videosData.items?.find((video: any) => 
          video.id === item.snippet.resourceId.videoId
        )?.contentDetails
      }));

      const stories = this.transformYouTubeData(enrichedItems);
      this.setCachedData('playlist_videos', stories);
      
      return stories;
    } catch (error) {
      console.error('Failed to fetch YouTube playlist:', error);
      console.warn('Falling back to default stories.');
      
      // Cache fallback stories for a shorter duration
      this.setCachedData('playlist_videos', FALLBACK_STORIES);
      return FALLBACK_STORIES;
    }
  }

  async getRandomStory(): Promise<Story | null> {
    const stories = await this.fetchPlaylistVideos();
    if (stories.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * stories.length);
    return stories[randomIndex];
  }

  async getFeaturedStory(): Promise<Story | null> {
    const stories = await this.fetchPlaylistVideos();
    if (stories.length === 0) return null;
    
    // Return the most recent story as featured
    return stories.sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )[0];
  }
}

export const youtubeService = new YouTubeService();