import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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

const PLAYLIST_ID = 'PLNlKU9V2hLNiqfqr3cuL5sIxBk33WUitL';
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

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch video details for duration, view count, and statistics
    const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);
    const videosResponse = await fetch(
      `${API_BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );

    let videosData = { items: [] };
    if (videosResponse.ok) {
      videosData = await videosResponse.json();
      console.log(`Fetched detailed data for ${videosData.items?.length || 0} videos`);
    } else {
      console.warn('Failed to fetch video details, continuing without detailed info');
    }
    
    // Transform YouTube data to our Story format with slugs
    const transformedStories = playlistData.items.map((item) => {
      const videoDetails = videosData.items?.find((video: any) => 
        video.id === item.snippet.resourceId.videoId
      );

      // Extract hashtags from description
      const hashtags = item.snippet.description?.match(/#[\w]+/g) || [];
      const tags = hashtags.map(tag => tag.replace('#', '')).slice(0, 5);

      const title = item.snippet.title;
      const slug = generateSlug(title);

      return {
        video_id: item.snippet.resourceId.videoId,
        title: title,
        description: item.snippet.description || '',
        thumbnail_url: item.snippet.thumbnails?.maxres?.url || 
                      item.snippet.thumbnails?.high?.url || 
                      item.snippet.thumbnails?.medium?.url ||
                      'https://img.youtube.com/vi/' + item.snippet.resourceId.videoId + '/maxresdefault.jpg',
        video_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        duration: videoDetails?.contentDetails?.duration || '',
        upload_date: item.snippet.publishedAt,
        tags: tags,
        views: videoDetails?.statistics?.viewCount ? parseInt(videoDetails.statistics.viewCount) : 0,
        slug: slug,
        is_active: true
      };
    });

    console.log(`Successfully transformed ${transformedStories.length} stories`);

    // Sync with database
    console.log('Starting database sync...');
    
    // Get existing stories from database
    const { data: existingStories, error: fetchError } = await supabase
      .from('stories')
      .select('video_id, slug');
    
    if (fetchError) {
      console.error('Error fetching existing stories:', fetchError);
    }

    const existingVideoIds = new Set(existingStories?.map(s => s.video_id) || []);
    const currentVideoIds = new Set(transformedStories.map(s => s.video_id));

    // Mark removed videos as inactive
    const removedVideoIds = [...existingVideoIds].filter(id => !currentVideoIds.has(id));
    if (removedVideoIds.length > 0) {
      console.log(`Marking ${removedVideoIds.length} removed videos as inactive`);
      const { error: deactivateError } = await supabase
        .from('stories')
        .update({ is_active: false })
        .in('video_id', removedVideoIds);
      
      if (deactivateError) {
        console.error('Error deactivating removed videos:', deactivateError);
      }
    }

    // Insert new stories or update existing ones
    const newStories = transformedStories.filter(story => !existingVideoIds.has(story.video_id));
    
    if (newStories.length > 0) {
      console.log(`Inserting ${newStories.length} new stories`);
      
      // Handle slug conflicts by appending video_id if needed
      for (const story of newStories) {
        const { data: existingSlug } = await supabase
          .from('stories')
          .select('id')
          .eq('slug', story.slug)
          .single();
        
        if (existingSlug) {
          story.slug = `${story.slug}-${story.video_id}`;
        }
      }
      
      const { error: insertError } = await supabase
        .from('stories')
        .insert(newStories);
      
      if (insertError) {
        console.error('Error inserting new stories:', insertError);
      } else {
        console.log('Successfully inserted new stories');
        
        // Send notifications for new videos
        for (const story of newStories) {
          try {
            console.log(`Sending notification for new video: ${story.title}`);
            const notificationResponse = await supabase.functions.invoke('send-new-video-notification', {
              body: { 
                video: {
                  video_id: story.video_id,
                  title: story.title,
                  description: story.description,
                  thumbnail_url: story.thumbnail_url,
                  video_url: story.video_url,
                  upload_date: story.upload_date
                }
              }
            });
            
            if (notificationResponse.error) {
              console.error('Error sending notification for video:', story.title, notificationResponse.error);
            } else {
              console.log('Notification sent successfully for video:', story.title);
            }
          } catch (error) {
            console.error('Failed to send notification for video:', story.title, error);
          }
        }
      }
    }

    // Update existing stories to ensure they're active
    const existingToUpdate = transformedStories.filter(story => existingVideoIds.has(story.video_id));
    if (existingToUpdate.length > 0) {
      console.log(`Updating ${existingToUpdate.length} existing stories`);
      
      for (const story of existingToUpdate) {
        const { error: updateError } = await supabase
          .from('stories')
          .update({ 
            title: story.title,
            description: story.description,
            thumbnail_url: story.thumbnail_url,
            duration: story.duration,
            tags: story.tags,
            views: story.views,
            upload_date: story.upload_date,
            is_active: true
          })
          .eq('video_id', story.video_id);
        
        if (updateError) {
          console.error(`Error updating story ${story.video_id}:`, updateError);
        }
      }
    }

    // Fetch all active stories from database for response
    const { data: allStories, error: allStoriesError } = await supabase
      .from('stories')
      .select('*')
      .eq('is_active', true)
      .order('upload_date', { ascending: false });

    if (allStoriesError) {
      console.error('Error fetching all stories:', allStoriesError);
      // Fallback to transformed stories
      const legacyStories = transformedStories.map(story => ({
        id: story.video_id,
        title: story.title,
        description: story.description,
        thumbnailUrl: story.thumbnail_url,
        videoUrl: story.video_url,
        duration: story.duration,
        uploadDate: story.upload_date,
        tags: story.tags,
        views: story.views
      }));
      
      return new Response(
        JSON.stringify({ stories: legacyStories }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform database stories to legacy format for backward compatibility
    const stories = allStories.map(story => ({
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

    console.log(`Returning ${stories.length} synchronized stories`);

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