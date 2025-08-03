import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import VideoGrid from '@/components/VideoGrid';
import VideoModal from '@/components/VideoModal';
import Footer from '@/components/Footer';
import { useStories } from '@/hooks/useStories';
import { useSearch } from '@/hooks/useSearch';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useFeaturedStory } from '@/hooks/useFeaturedStory';
import { Story } from '@/types/story';
import { toast } from '@/hooks/use-toast';
import SEOMetaTags from '@/components/SEOMetaTags';

const Index = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    stories, 
    loading,
    forceSync
  } = useStories();

  const { isWatched } = useWatchHistory();
  const { featuredStory } = useFeaturedStory();

  // Function to get a random story, preferring unwatched videos
  const getRandomStory = async () => {
    if (stories.length === 0) return null;
    
    // First, try to find unwatched videos
    const unwatchedStories = stories.filter(story => !isWatched(story.videoUrl));
    
    if (unwatchedStories.length > 0) {
      // Pick a random unwatched video
      const randomIndex = Math.floor(Math.random() * unwatchedStories.length);
      return unwatchedStories[randomIndex];
    } else {
      // If all videos are watched, pick any random video
      const randomIndex = Math.floor(Math.random() * stories.length);
      return stories[randomIndex];
    }
  };
  
  const { 
    searchQuery, 
    setSearchQuery, 
    filteredStories 
  } = useSearch(stories);

  const handleVideoClick = (story: Story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleRandomStory = async () => {
    try {
      const randomStory = await getRandomStory();
      if (randomStory) {
        handleVideoClick(randomStory);
      } else {
        toast({
          title: "No stories available",
          description: "Please check back later for new stories.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load a random story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartWatching = () => {
    if (featuredStory) {
      handleVideoClick(featuredStory);
    } else if (filteredStories.length > 0) {
      handleVideoClick(filteredStories[0]);
    } else {
      handleRandomStory();
    }
  };

  const handleBrowseCollection = () => {
    const videoGridElement = document.getElementById('video-collection');
    if (videoGridElement) {
      videoGridElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStory(null);
  };

  const getCurrentStoryIndex = () => {
    if (!selectedStory) return -1;
    return filteredStories.findIndex(story => story.id === selectedStory.id);
  };

  const handlePreviousStory = () => {
    const currentIndex = getCurrentStoryIndex();
    if (currentIndex > 0) {
      setSelectedStory(filteredStories[currentIndex - 1]);
    }
  };

  const handleNextStory = () => {
    const currentIndex = getCurrentStoryIndex();
    if (currentIndex < filteredStories.length - 1) {
      setSelectedStory(filteredStories[currentIndex + 1]);
    }
  };

  const currentIndex = getCurrentStoryIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredStories.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <SEOMetaTags isHomepage={true} />
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onRandomStory={handleRandomStory}
        onSync={forceSync}
      />
      
      <main>
        <HeroSection
          onStartWatching={handleStartWatching}
          onBrowseCollection={handleBrowseCollection}
          featuredStory={featuredStory}
        />
        
        <div id="video-collection">
          <VideoGrid
            stories={filteredStories}
            loading={loading}
            onVideoClick={handleVideoClick}
          />
        </div>
      </main>
      
      <Footer />
      
      <VideoModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPrevious={hasPrevious ? handlePreviousStory : undefined}
        onNext={hasNext ? handleNextStory : undefined}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </div>
  );
};

export default Index;
