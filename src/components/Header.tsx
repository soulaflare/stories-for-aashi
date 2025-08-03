import { useState } from 'react';
import { Search, Shuffle, User, LogOut, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthModal from './AuthModal';
import UserSettingsModal from './UserSettingsModal';
import { ThemeToggle } from './ThemeToggle';
import bookIcon from '/book-icon.png';
interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRandomStory: () => void;
  onSync?: () => void;
}
const Header = ({
  searchQuery,
  onSearchChange,
  onRandomStory,
  onSync
}: HeaderProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const {
    user,
    signOut,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  };
  return <>
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container-responsive py-4">
        {isMobile ?
        // Mobile: Two-row layout
        <div className="space-y-3">
            {/* Top row: Logo + User Actions */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${location.pathname !== '/' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} onClick={handleLogoClick}>
                <img src={bookIcon} alt="Book icon" className="h-8 w-8" />
                <h1 className="text-lg font-display font-medium text-foreground">Stories for Aashi</h1>
              </div>

              <div className="flex items-center space-x-1">
                <ThemeToggle />
                {!loading && <>
                    {user ? <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback>
                                {user.email?.charAt(0).toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            <User className="mr-2 h-4 w-4" />
                            {user.email}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> : <Button onClick={() => setShowAuthModal(true)} variant="outline" size="sm">
                        Sign In
                      </Button>}
                  </>}
              </div>
            </div>

            {/* Bottom row: Search + Surprise Me */}
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input type="text" placeholder="Search stories..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="search-input pl-10 w-full" />
                </div>
              </div>
              <Button onClick={onRandomStory} variant="outline" size="sm" className="flex items-center justify-center min-w-[44px]" aria-label="Surprise Me">
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div> :
        // Desktop: Single-row layout
        <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`flex items-center space-x-2 ${location.pathname !== '/' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`} onClick={handleLogoClick}>
              <img src={bookIcon} alt="Book icon" className="h-10 w-10" />
              <h1 className="text-2xl font-display font-medium text-foreground">
                Stories for Aashi
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input type="text" placeholder="Search stories..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="search-input pl-10" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button onClick={onRandomStory} variant="outline" size="sm" className="flex items-center space-x-2">
                <Shuffle className="h-4 w-4" />
                <span>Surprise Me</span>
              </Button>
              
              <ThemeToggle />

              {!loading && <>
                  {user ? <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.email?.charAt(0).toUpperCase() || 'A'}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <User className="mr-2 h-4 w-4" />
                          {user.email}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => signOut()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> : <Button onClick={() => setShowAuthModal(true)} variant="outline" size="sm">
                      Sign In
                    </Button>}
                </>}
            </div>
          </div>}
      </div>
    </header>

    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    
    <UserSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} onSync={onSync} />
  </>;
};
export default Header;