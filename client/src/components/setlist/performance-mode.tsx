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
      {/* Sticky Set Tabs with Controls */}
      <div className="sticky top-0 z-40 bg-card border-b shadow-sm" data-testid="performance-sticky-tabs">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header with controls inline and clock centered */}
          <div className="flex items-center justify-between py-2 gap-2 overflow-x-auto">
            {/* Set buttons */}
            <div className="flex space-x-1 shrink-0">
              {state.sets.map((set, index) => (
                <Button
                  key={set.id}
                  variant={index === state.currentSetIndex ? "default" : "outline"}
                  onClick={() => actions.switchToSet(index)}
                  className="font-medium min-w-[84px] text-center h-[34px] text-sm px-3 shrink-0"
                  data-testid={`button-performance-set-${index}`}
                >
                  {set.name}
                </Button>
              ))}
            </div>
            
            {/* Clock - centered */}
            <div className="text-center text-sm font-mono text-muted-foreground shrink-0" data-testid="performance-clock">
              {currentTime}
            </div>
            
            {/* Performance Mode Controls - inline with sets */}
            <div className="flex items-center space-x-1 shrink-0" data-testid="performance-controls-header">
              <Button 
                size="icon"
                variant="outline"
                onClick={() => actions.setFontSize(state.fontSize - 10)}
                className="h-[34px] w-[34px] shrink-0"
                data-testid="button-performance-font-decrease"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[2rem] text-center shrink-0" data-testid="performance-font-size">
                {state.fontSize}%
              </span>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => actions.setFontSize(state.fontSize + 10)}
                className="h-[34px] w-[34px] shrink-0"
                data-testid="button-performance-font-increase"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button 
                size="icon"
                variant="outline"
                onClick={actions.toggleDarkMode}
                className="h-[34px] w-[34px] shrink-0"
                data-testid="button-performance-dark-toggle"
              >
                {state.isDarkMode ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              </Button>
              
              <Button 
                variant="destructive"
                onClick={actions.togglePerformanceMode}
                className="h-[34px] shrink-0 text-sm px-3"
                data-testid="button-exit-performance"
              >
                <X className="mr-1 h-3 w-3" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar - 50% smaller */}
      <div className="bg-card border-b p-2" data-testid="performance-top-nav">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="outline"
            onClick={() => actions.navigateSong(-1)}
            disabled={!hasPrev}
            className="h-[48px] min-w-[60px] text-xs px-2"
            data-testid="button-performance-prev-top"
          >
            <ChevronLeft className="mr-1 h-2 w-2" />
            {getPrevSongName() || 'Previous'}
          </Button>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Song</div>
            <div className="text-sm font-semibold" data-testid="performance-progress">
              {Math.max(0, state.currentSongIndex + 1)} of {currentSet.songs.length}
            </div>
          </div>
          
          <Button 
            onClick={() => actions.navigateSong(1)}
            disabled={!hasNext}
            className="h-[48px] min-w-[60px] text-xs px-2"
            data-testid="button-performance-next-top"
          >
            {getNextSongName() || 'Next'}
            <ChevronRight className="ml-1 h-2 w-2" />
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

      {/* Bottom Navigation Bar - 50% smaller */}
      <div className="sticky bottom-0 bg-card border-t p-2" data-testid="performance-bottom-nav">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="outline"
            onClick={() => actions.navigateSong(-1)}
            disabled={!hasPrev}
            className="h-[48px] min-w-[60px] text-xs px-2"
            data-testid="button-performance-prev-bottom"
          >
            <ChevronLeft className="mr-1 h-2 w-2" />
            {getPrevSongName() || 'Previous'}
          </Button>
          
          <Button 
            onClick={() => actions.navigateSong(1)}
            disabled={!hasNext}
            className="h-[48px] min-w-[60px] text-xs px-2"
            data-testid="button-performance-next-bottom"
          >
            {getNextSongName() || 'Next'}
            <ChevronRight className="ml-1 h-2 w-2" />
          </Button>
        </div>
      </div>


    </div>
  );
}
