import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Story } from '@/types/story';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useEffect } from 'react';

interface VideoModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const VideoModal = ({ 
  story, 
  isOpen, 
  onClose, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext 
}: VideoModalProps) => {
  const { markAsWatched } = useWatchHistory();

  // Mark video as watched when modal opens and video starts playing
  useEffect(() => {
    if (story && isOpen) {
      // Small delay to ensure the video starts playing
      const timer = setTimeout(() => {
        markAsWatched(story.videoUrl, story.title);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [story, isOpen, markAsWatched]);

  if (!story) return null;

  const getYouTubeEmbedUrl = (videoUrl: string) => {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-auto max-h-[90vh] p-0 bg-background border-border overflow-y-auto">
        <div className="min-h-0">{/* Wrapper to ensure proper flex behavior */}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            {hasPrevious && onPrevious && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {hasNext && onNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                className="hover:bg-secondary"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(story.videoUrl, '_blank')}
            className="hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Watch on YouTube
          </Button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black">
          <div className="aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(story.videoUrl)}
              title={story.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Story Details */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-display font-medium text-foreground mb-2">
              {story.title}
            </h2>
            <p className="text-muted-foreground">
              Published on {formatDate(story.uploadDate)}
            </p>
          </div>

          {story.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {story.description}
              </p>
            </div>
          )}

          {story.tags && story.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;