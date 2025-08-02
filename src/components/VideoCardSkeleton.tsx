const VideoCardSkeleton = () => {
  return (
    <div className="video-card animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="video-card-image bg-muted">
        <div className="w-full h-full bg-gradient-to-r from-muted to-muted/50"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-muted/70 rounded w-full"></div>
          <div className="h-4 bg-muted/70 rounded w-4/5"></div>
        </div>
        
        {/* Meta */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 bg-muted/50 rounded w-20"></div>
          <div className="h-3 bg-muted/50 rounded w-16"></div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-muted/50 rounded-full w-12"></div>
          <div className="h-5 bg-muted/50 rounded-full w-16"></div>
          <div className="h-5 bg-muted/50 rounded-full w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;