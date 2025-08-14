import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { AppState } from '@shared/schema';
import { parseMarkdown } from '@/lib/markdown-parser';

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
            <div className="text-sm text-muted-foreground" data-testid="text-current-song-info">
              {currentSong ? `${state.currentSongIndex + 1} of ${currentSet.songs.length}` : 'No song selected'}
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
                  __html: parseMarkdown(currentSong.content) 
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
