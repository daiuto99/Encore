import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppState } from '@shared/schema';
import { parseMarkdown } from '@/lib/markdown-parser';
import { useTouchGestures } from '@/hooks/use-touch-gestures';

interface PerformanceModeProps {
  state: AppState;
  actions: any;
}

export default function PerformanceMode({ state, actions }: PerformanceModeProps) {
  const [currentTime, setCurrentTime] = useState('');
  
  const currentSet = state.sets[state.currentSetIndex];
  const currentSong = currentSet.songs[state.currentSongIndex];
  const hasPrev = state.currentSongIndex > 0;
  const hasNext = state.currentSongIndex < currentSet.songs.length - 1;

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Touch gestures for swipe navigation
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => actions.navigateSong(1),
    onSwipeRight: () => actions.navigateSong(-1)
  });

  const getPrevSongName = () => {
    if (hasPrev && state.currentSongIndex > 0) {
      return currentSet.songs[state.currentSongIndex - 1].name;
    }
    return null;
  };

  const getNextSongName = () => {
    if (hasNext && state.currentSongIndex < currentSet.songs.length - 1) {
      return currentSet.songs[state.currentSongIndex + 1].name;
    }
    return null;
  };

  return (
    <div className="performance-ui min-h-screen bg-background">
      {/* Sticky Set Tabs */}
      <div className="sticky top-0 z-40 bg-card border-b shadow-sm" data-testid="performance-sticky-tabs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            {state.sets.map((set, index) => (
              <Button
                key={set.id}
                variant={index === state.currentSetIndex ? "default" : "outline"}
                size="lg"
                onClick={() => actions.switchToSet(index)}
                className="font-medium min-w-[120px] text-center min-h-[48px]"
                data-testid={`button-performance-set-${index}`}
              >
                {set.name}
              </Button>
            ))}
          </div>
          {/* Clock */}
          <div className="text-center py-2 text-lg font-mono text-muted-foreground" data-testid="performance-clock">
            {currentTime}
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="bg-card border-b p-4" data-testid="performance-top-nav">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => actions.navigateSong(-1)}
            disabled={!hasPrev}
            className="min-h-[48px] min-w-[120px]"
            data-testid="button-performance-prev-top"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {getPrevSongName() || 'Previous'}
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Song</div>
            <div className="text-lg font-semibold" data-testid="performance-progress">
              {Math.max(0, state.currentSongIndex + 1)} of {currentSet.songs.length}
            </div>
          </div>
          
          <Button 
            size="lg"
            onClick={() => actions.navigateSong(1)}
            disabled={!hasNext}
            className="min-h-[48px] min-w-[120px]"
            data-testid="button-performance-next-top"
          >
            {getNextSongName() || 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Song Viewer */}
      <div 
        className="flex-1 p-6 swipe-area"
        {...touchGestures}
        data-testid="performance-song-content"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4" data-testid="performance-song-title">
            {currentSong ? currentSong.name : 'No Song Selected'}
          </h2>
          <div className="song-viewer prose max-w-none" data-testid="performance-song-viewer">
            {currentSong ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(currentSong.content) 
                }} 
              />
            ) : (
              <p>No song selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="sticky bottom-0 bg-card border-t p-4" data-testid="performance-bottom-nav">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => actions.navigateSong(-1)}
            disabled={!hasPrev}
            className="min-h-[48px] min-w-[120px]"
            data-testid="button-performance-prev-bottom"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {getPrevSongName() || 'Previous'}
          </Button>
          
          <Button 
            size="lg"
            onClick={() => actions.navigateSong(1)}
            disabled={!hasNext}
            className="min-h-[48px] min-w-[120px]"
            data-testid="button-performance-next-bottom"
          >
            {getNextSongName() || 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Mode Controls Overlay */}
      <div className="fixed top-4 left-4 z-50 bg-card rounded-lg shadow-lg border p-4 space-y-3" data-testid="performance-controls-overlay">
        <Button 
          variant="destructive"
          className="w-full min-h-[48px]"
          onClick={actions.togglePerformanceMode}
          data-testid="button-exit-performance"
        >
          <X className="mr-2 h-4 w-4" />
          Exit Performance
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            size="icon"
            variant="outline"
            onClick={() => actions.setFontSize(state.fontSize - 10)}
            className="min-h-[48px] min-w-[48px]"
            data-testid="button-performance-font-decrease"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center" data-testid="performance-font-size">
            {state.fontSize}%
          </span>
          <Button 
            size="icon"
            variant="outline"
            onClick={() => actions.setFontSize(state.fontSize + 10)}
            className="min-h-[48px] min-w-[48px]"
            data-testid="button-performance-font-increase"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline"
          className="w-full min-h-[48px]"
          onClick={actions.toggleDarkMode}
          data-testid="button-performance-dark-toggle"
        >
          {state.isDarkMode ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
