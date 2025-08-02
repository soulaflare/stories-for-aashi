import { useState } from 'react';
import { Search, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRandomStory: () => void;
}

const Header = ({ searchQuery, onSearchChange, onRandomStory }: HeaderProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container-responsive py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-display font-medium text-foreground">
              Stories for Aashi
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className={`relative transition-all duration-200 ${
              isSearchFocused ? 'scale-105' : ''
            }`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="search-input pl-10"
              />
            </div>
          </div>

          {/* Random Button */}
          <Button
            onClick={onRandomStory}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-secondary"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Surprise Me</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;