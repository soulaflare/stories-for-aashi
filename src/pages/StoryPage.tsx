import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, Calendar, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useStoryBySlug } from '@/hooks/useStories';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import SEOMetaTags from '@/components/SEOMetaTags';

export default function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { story, loading, error } = useStoryBySlug(slug || '');

  const handleShare = async () => {
    if (!story) return;

    const shareData = {
      title: story.title,
      text: story.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Story link has been copied to your clipboard.",
      });
    }
  };

  const getYouTubeEmbedUrl = (videoUrl: string) => {
    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    
    // Parse ISO 8601 duration (PT#M#S)
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const minutes = match[1] ? parseInt(match[1]) : 0;
      const seconds = match[2] ? parseInt(match[2]) : 0;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return duration;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-24"></div>
            <div className="h-12 bg-muted rounded mb-6 w-3/4"></div>
            <div className="aspect-video bg-muted rounded-lg mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
  return (
    <div className="min-h-screen bg-background">
      <SEOMetaTags story={story} />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The story you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse All Stories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(story.videoUrl);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Story Content */}
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {story.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {story.uploadDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(story.uploadDate), { addSuffix: true })}
              </div>
            )}
            {story.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(story.duration)}
              </div>
            )}
            {story.views && (
              <div>
                {story.views.toLocaleString()} views
              </div>
            )}
          </div>

          {/* Video Player */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={story.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Video not available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {story.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this story</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {story.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4" />
                  <h2 className="text-lg font-semibold">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Enjoy this story?</h2>
              <p className="text-muted-foreground mb-4">
                Discover more magical stories for entertainment.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse More Stories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}