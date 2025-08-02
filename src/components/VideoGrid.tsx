import { Story } from '@/types/story';
import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';

interface VideoGridProps {
  stories: Story[];
  loading: boolean;
  onVideoClick: (story: Story) => void;
}

const VideoGrid = ({ stories, loading, onVideoClick }: VideoGridProps) => {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return (
      <section className="py-16">
        <div className="container-responsive text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="text-xl font-display font-medium text-foreground">
              No Stories Found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later for new stories.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container-responsive">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-medium text-foreground mb-2">
            Your Stories
          </h2>
          <p className="text-muted-foreground">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} available
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={story.id}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <VideoCard
                story={story}
                onClick={() => onVideoClick(story)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;