import { Helmet } from 'react-helmet-async';
import { Story } from '@/types/story';

interface SEOMetaTagsProps {
  story?: Story;
  isHomepage?: boolean;
}

export default function SEOMetaTags({ story, isHomepage = false }: SEOMetaTagsProps) {
  if (isHomepage) {
    return (
      <Helmet>
        <title>Magical short stories for bedtime, awake time, and all times in between</title>
        <meta 
          name="description" 
          content="Discover a magical collection of stories. Perfect for relaxation and entertainment, our stories inspire imagination and wonder." 
        />
        <meta name="keywords" content="stories, entertainment, video stories, magical tales, bedtime stories, children stories, family time" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Magical Stories for Entertainment" />
        <meta property="og:description" content="Discover a magical collection of stories. Perfect for relaxation and entertainment, our stories inspire imagination and wonder." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Magical Stories for Entertainment" />
        <meta name="twitter:description" content="Discover a magical collection of stories for entertainment." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Magical Stories Collection",
            "description": "A collection of magical stories for entertainment",
            "url": window.location.origin,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${window.location.origin}/?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
    );
  }

  if (!story) return null;

  const videoId = story.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  const storyUrl = `${window.location.origin}/story/${story.slug}`;

  const formatDuration = (duration: string) => {
    if (!duration) return 'PT0M';
    
    // Convert YouTube duration format to ISO 8601
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const minutes = match[1] ? parseInt(match[1]) : 0;
      const seconds = match[2] ? parseInt(match[2]) : 0;
      return `PT${minutes}M${seconds}S`;
    }
    return duration;
  };

  return (
    <Helmet>
      <title>{story.title} | Magical Stories</title>
      <meta name="description" content={story.description || `Watch ${story.title} - A magical story for entertainment.`} />
      <meta name="keywords" content={`${story.tags?.join(', ') || 'story'}, entertainment, video stories, bedtime stories, children stories`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={storyUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={story.title} />
      <meta property="og:description" content={story.description || `Watch ${story.title} - A magical story for entertainment.`} />
      <meta property="og:type" content="video.other" />
      <meta property="og:url" content={storyUrl} />
      <meta property="og:image" content={story.thumbnailUrl} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta property="og:video" content={embedUrl} />
      <meta property="og:video:url" content={story.videoUrl} />
      <meta property="og:video:type" content="text/html" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={story.title} />
      <meta name="twitter:description" content={story.description || `Watch ${story.title} - A magical story for entertainment.`} />
      <meta name="twitter:image" content={story.thumbnailUrl} />
      
      {/* Structured Data for Video */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": story.title,
          "description": story.description,
          "thumbnailUrl": story.thumbnailUrl,
          "uploadDate": story.uploadDate,
          "duration": formatDuration(story.duration),
          "contentUrl": story.videoUrl,
          "embedUrl": embedUrl,
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": { "@type": "WatchAction" },
            "userInteractionCount": story.views || 0
          },
          "keywords": story.tags?.join(', ') || 'story, entertainment, bedtime stories, children',
          "genre": "Entertainment",
          "familyFriendly": true
        })}
      </script>
    </Helmet>
  );
}