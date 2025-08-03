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
          content="Discover a magical collection of bedtime stories for children. Perfect for bedtime routines, our stories inspire imagination and sweet dreams." 
        />
        <meta name="keywords" content="bedtime stories, children stories, kids entertainment, educational content, family time" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Magical Bedtime Stories for Children" />
        <meta property="og:description" content="Discover a magical collection of bedtime stories for children. Perfect for bedtime routines, our stories inspire imagination and sweet dreams." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Magical Bedtime Stories for Children" />
        <meta name="twitter:description" content="Discover a magical collection of bedtime stories for children." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Magical Bedtime Stories",
            "description": "A collection of magical bedtime stories for children",
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
      <title>{story.title} | Magical Bedtime Stories</title>
      <meta name="description" content={story.description || `Watch ${story.title} - A magical bedtime story for children.`} />
      <meta name="keywords" content={`${story.tags?.join(', ') || 'bedtime story'}, children stories, kids entertainment`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={storyUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={story.title} />
      <meta property="og:description" content={story.description || `Watch ${story.title} - A magical bedtime story for children.`} />
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
      <meta name="twitter:description" content={story.description || `Watch ${story.title} - A magical bedtime story for children.`} />
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
          "keywords": story.tags?.join(', ') || 'bedtime story, children',
          "genre": "Children's Entertainment",
          "familyFriendly": true,
          "audience": {
            "@type": "Audience",
            "audienceType": "Children"
          }
        })}
      </script>
    </Helmet>
  );
}