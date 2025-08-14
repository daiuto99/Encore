import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight, FileText, RotateCcw } from 'lucide-react';
import { AppState } from '@shared/schema';
import { parseMarkdown } from '@/lib/markdown-parser';
import { transposeChords, getKeyDisplayName } from '@/lib/key-transposition';

interface SongViewerProps {
  state: AppState;
  actions: any;
}

export default function SongViewer({ state, actions }: SongViewerProps) {
  const currentSet = state.sets[state.currentSetIndex];
  const currentSong = currentSet.songs[state.currentSongIndex];
  const hasPrev = state.currentSongIndex > 0;
  const hasNext = state.currentSongIndex < currentSet.songs.length - 1;

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
    <div className="space-y-6">
      {/* Navigation */}
      <Card data-testid="card-navigation">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChevronRight className="mr-2 h-5 w-5 text-primary" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => actions.navigateSong(-1)}
              disabled={!hasPrev}
              data-testid="button-prev-song"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {getPrevSongName() ? getPrevSongName() : 'Previous'}
            </Button>
            <Button 
              variant="default"
              className="flex-1"
              onClick={() => actions.navigateSong(1)}
              disabled={!hasNext}
              data-testid="button-next-song"
            >
              {getNextSongName() ? getNextSongName() : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Use ← → arrow keys to navigate
          </div>
        </CardContent>
      </Card>

      {/* Song Viewer */}
      <Card data-testid="card-song-viewer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-primary" />
              Song Viewer
            </CardTitle>
            <div className="flex items-center space-x-4">
              {/* Key Transposition Controls */}
              {currentSong && (
                <div className="flex items-center space-x-2" data-testid="key-controls">
                  <span className="text-sm text-muted-foreground">Key:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => actions.transposeSong(state.currentSongIndex, -1)}
                    disabled={!currentSong || currentSong.keyTransposition <= -6}
                    data-testid="button-transpose-flat"
                    className="h-8 w-8 p-0"
                  >
                    ♭
                  </Button>
                  <span 
                    className="text-xs text-muted-foreground min-w-[4rem] text-center font-mono"
                    data-testid="text-key-display"
                  >
                    {getKeyDisplayName(currentSong.keyTransposition)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => actions.transposeSong(state.currentSongIndex, 1)}
                    disabled={!currentSong || currentSong.keyTransposition >= 6}
                    data-testid="button-transpose-sharp"
                    className="h-8 w-8 p-0"
                  >
                    ♯
                  </Button>
                  {currentSong.keyTransposition !== 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => actions.resetSongKey(state.currentSongIndex)}
                      data-testid="button-reset-key"
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <div className="text-sm text-muted-foreground" data-testid="text-current-song-info">
                {currentSong ? `${state.currentSongIndex + 1} of ${currentSet.songs.length}` : 'No song selected'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="song-viewer prose max-w-none min-h-[400px] p-4 bg-muted/20 rounded-md overflow-y-auto custom-scrollbar" 
            data-testid="viewer-song-content"
          >
            {currentSong ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(transposeChords(currentSong.content, currentSong.keyTransposition)) 
                }} 
              />
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg mb-2">No song selected</p>
                <p className="text-sm">Select a song from your set to view its content</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
