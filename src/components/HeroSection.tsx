import { Play, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeroSectionProps {
  onStartWatching: () => void;
  onBrowseCollection: () => void;
  onRandomStory: () => void;
  featuredStory?: {
    title: string;
    thumbnailUrl: string;
  };
}
const HeroSection = ({
  onStartWatching,
  onBrowseCollection,
  onRandomStory,
  featuredStory
}: HeroSectionProps) => {
  return <section className="py-16 lg:py-24 bg-gradient-to-br from-background to-secondary/20">
      <div className="container-responsive">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Typography */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-hero">
                Stories for
                <span className="block text-primary">Aashi</span>
              </h1>
              <p className="text-subtitle max-w-lg">A lovingly curated trove of short stories—each a doorway to distant worlds, perspectives, and perhaps even self-discovery.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Button onClick={onStartWatching} className="btn-hero group h-9 px-4 sm:h-11 sm:px-6">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Watching
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onRandomStory}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                title="Surprise Me!"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-9 px-4 sm:h-11 sm:px-6 hover:bg-secondary" onClick={onBrowseCollection}>
                Browse Collection
              </Button>
            </div>
            
          </div>

          {/* Right: Featured Content */}
          <div className="relative animate-slide-up">
            <div className="relative">
              {featuredStory ? <div className="video-card group cursor-pointer" onClick={onStartWatching}>
                  <div className="video-card-image">
                    <img src={featuredStory.thumbnailUrl} alt={featuredStory.title} className="w-full h-full object-cover transition-transform duration-500 scale-[1.006] group-hover:scale-105" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-8 w-8 text-primary fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-card-title mb-2">{featuredStory.title}</h3>
                    <p className="text-card-meta">Featured Story</p>
                  </div>
                </div> : <div className="video-card">
                  <div className="video-card-image bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Your stories await</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-card-title mb-2">Ready to Begin</h3>
                    <p className="text-card-meta">Start your journey</p>
                  </div>
                </div>}
              
              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
              <div className="absolute -z-10 -bottom-8 -left-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;