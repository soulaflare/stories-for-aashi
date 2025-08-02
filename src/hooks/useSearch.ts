import { useState, useMemo } from 'react';
import { Story } from '@/types/story';

export const useSearch = (stories: Story[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories;

    // Filter by search query - search through all story content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = stories.filter(story => {
        // Search in title
        const titleMatch = story.title.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = story.description.toLowerCase().includes(query);
        
        // Search in tags
        const tagsMatch = story.tags.some(tag => tag.toLowerCase().includes(query));
        
        // Search in duration (for queries like "5 minutes", "short", etc.)
        const durationMatch = story.duration && story.duration.toLowerCase().includes(query);
        
        // Search in upload date (for queries like "2024", "january", etc.)
        const dateMatch = story.uploadDate && 
          new Date(story.uploadDate).toLocaleDateString().toLowerCase().includes(query);
        
        // Search in year
        const yearMatch = story.uploadDate && 
          new Date(story.uploadDate).getFullYear().toString().includes(query);
        
        // Search in month names
        const monthMatch = story.uploadDate && 
          new Date(story.uploadDate).toLocaleDateString('en-US', { month: 'long' })
            .toLowerCase().includes(query);
        
        // Search in video ID (for specific video searches)
        const videoIdMatch = story.id.toLowerCase().includes(query);
        
        // Search in slug if available
        const slugMatch = story.slug && story.slug.toLowerCase().includes(query);
        
        return titleMatch || descriptionMatch || tagsMatch || durationMatch || 
               dateMatch || yearMatch || monthMatch || videoIdMatch || slugMatch;
      });
    }

    // Sort stories
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [stories, searchQuery, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredStories: filteredAndSortedStories
  };
};