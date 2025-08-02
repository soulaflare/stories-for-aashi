import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubePlaylistResponse {
  items: YouTubeVideoItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeVideoItem {
  snippet: {
    resourceId: {
      videoId: string;
    };
    title: string;
    description: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium: { url: string };
    };
    publishedAt: string;
  };
  contentDetails?: {
    duration: string;
  };
}

const PLAYLIST_ID = 'PLNlKU9V2hLNjQxx0uxG6wmKtXeFqRz33Y';
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the YouTube API key from Supabase secrets
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not found in secrets');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching YouTube playlist:', PLAYLIST_ID);
    console.log('Using API key (first 10 chars):', YOUTUBE_API_KEY?.substring(0, 10));
    
    // Let's also try a test API call to verify the key works
    const testResponse = await fetch(`${API_BASE_URL}/search?part=snippet&q=test&key=${YOUTUBE_API_KEY}&maxResults=1`);
    console.log('Test API call status:', testResponse.status);

    // Fetch playlist items
    const playlistResponse = await fetch(
      `${API_BASE_URL}/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text();
      console.error('YouTube API playlist error:', playlistResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `YouTube API error: ${playlistResponse.status}` }),
        { 
          status: playlistResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const playlistData: YouTubePlaylistResponse = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      console.warn('No videos found in playlist');
      return new Response(
        JSON.stringify({ stories: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${playlistData.items.length} videos in playlist`);

    // Fetch video details for duration
    const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);
    const videosResponse = await fetch(
      `${API_BASE_URL}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );

    let videosData = { items: [] };
    if (videosResponse.ok) {
      videosData = await videosResponse.json();
    } else {
      console.warn('Failed to fetch video details, continuing without duration info');
    }
    
    // Transform YouTube data to our Story format
    const stories = playlistData.items.map((item) => {
      const videoDetails = videosData.items?.find((video: any) => 
        video.id === item.snippet.resourceId.videoId
      );

      // Extract hashtags from description
      const hashtags = item.snippet.description?.match(/#[\w]+/g) || [];
      const tags = hashtags.map(tag => tag.replace('#', '')).slice(0, 5);

      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url || 
                     item.snippet.thumbnails?.high?.url || 
                     item.snippet.thumbnails?.medium?.url ||
                     item.snippet.thumbnails?.default?.url ||
                     'https://img.youtube.com/vi/' + item.snippet.resourceId.videoId + '/maxresdefault.jpg',
        videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        duration: videoDetails?.contentDetails?.duration || '',
        uploadDate: item.snippet.publishedAt,
        tags: tags,
        views: Math.floor(Math.random() * 5000) + 100 // Placeholder as view count requires additional API call
      };
    });

    console.log(`Successfully transformed ${stories.length} stories`);

    return new Response(
      JSON.stringify({ stories }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-youtube-playlist function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});