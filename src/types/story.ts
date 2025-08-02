export interface Story {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  uploadDate: string;
  tags: string[];
  views?: number;
  slug?: string;
}

export interface YouTubePlaylistResponse {
  items: YouTubeVideoItem[];
  nextPageToken?: string;
}

export interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
  };
  contentDetails?: {
    duration: string;
  };
}

export interface SearchFilters {
  query: string;
  sortBy: 'newest' | 'oldest' | 'title';
}