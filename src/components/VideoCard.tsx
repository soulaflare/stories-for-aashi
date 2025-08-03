import { Play, Clock, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Story } from '@/types/story';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Button } from '@/components/ui/button';

interface VideoCardProps {
  story: Story;
  onClick: () => void;
}

const VideoCard = ({ story, onClick }: VideoCardProps) => {
  const { isWatched } = useWatchHistory();
  const watched = isWatched(story.videoUrl);

  const formatDuration = (duration: string) => {
    // Convert YouTube duration format (PT1M30S) to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article 
      className={`video-card group cursor-pointer animate-scale-in h-full flex flex-col ${watched ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="video-card-image flex-shrink-0">
        <img
          src={story.thumbnailUrl}
          alt={story.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 scale-[1.006] group-hover:scale-105 block"
          loading="lazy"
        />
        
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Play className="h-6 w-6 text-primary fill-current" />
          </div>
        </div>
        
        {/* Duration Badge */}
        {story.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(story.duration)}</span>
          </div>
        )}

        {/* Watched Badge */}
        {watched && (
          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Check className="h-3 w-3" />
            <span>Watched</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-3 flex-1 flex flex-col">
        <h3 className="text-card-title group-hover:text-primary transition-colors duration-200 flex-shrink-0">
          {story.title}
        </h3>
        
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            {story.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {story.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-card-meta">
              <span>{formatDate(story.uploadDate)}</span>
              {story.views && (
                <span>{story.views.toLocaleString()} views</span>
              )}
            </div>
          </div>
          
          {/* Tags */}
          <div className="min-h-[32px] flex items-end">
            {story.tags && story.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {story.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {story.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{story.tags.length - 3} more
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-1" />
              Watch
            </Button>
            {story.slug && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={`/story/${story.slug}`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;