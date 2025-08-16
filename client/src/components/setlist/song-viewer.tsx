import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ChevronLeft, ChevronRight, FileText, Edit, Music, X } from 'lucide-react';
import { AppState, Song } from '@shared/schema';
import { parseMarkdown } from '@/lib/markdown-parser';
import SongEditor from './song-editor';

interface SongViewerProps {
  state: AppState;
  actions: any;
  onSongUpdate?: (song: Song) => void;
  onSyncToFolder?: (song: Song) => Promise<void>;
}

export default function SongViewer({ state, actions, onSongUpdate, onSyncToFolder }: SongViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHarmonies, setShowHarmonies] = useState(true);
  
  const currentSet = state.sets[state.currentSetIndex];
  const setCurrentSong = currentSet.songs[state.currentSongIndex];
  const currentSong = state.selectedPreviewSong || setCurrentSong;
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

  const handleSongSave = (updatedSong: Song) => {
    if (onSongUpdate) {
      onSongUpdate(updatedSong);
    }
    setIsEditing(false);
  };

  const renderSongContent = () => {
    if (!currentSong) return '';
    
    // Process harmony syntax for display
    let processedContent = currentSong.content;
    
    if (showHarmonies) {
      processedContent = processedContent.replace(
        /\{harmony\}([\s\S]*?)\{\/harmony\}/g, 
        '<span class="harmony-line">$1</span>'
      );
    } else {
      // Remove harmony tags but keep the content
      processedContent = processedContent.replace(
        /\{harmony\}([\s\S]*?)\{\/harmony\}/g, 
        '$1'
      );
    }
    
    return parseMarkdown(processedContent);
  };

  if (isEditing && currentSong) {
    return (
      <SongEditor
        song={currentSong}
        onSave={handleSongSave}
        onCancel={() => setIsEditing(false)}
        onSyncToFolder={onSyncToFolder}
      />
    );
  }

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
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-primary" />
                {currentSong ? currentSong.name : 'No song selected'}
                {state.selectedPreviewSong && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Preview Mode
                  </Badge>
                )}
              </CardTitle>
              {currentSong?.isModified && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Modified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground" data-testid="text-current-song-info">
                {state.selectedPreviewSong 
                  ? 'Preview from Available Songs'
                  : currentSong 
                    ? `${state.currentSongIndex + 1} of ${currentSet.songs.length}`
                    : 'No song selected'
                }
              </div>
              
              {currentSong && (
                <div className="flex gap-1">
                  {state.selectedPreviewSong && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.selectPreviewSong(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Exit Preview
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHarmonies(!showHarmonies)}
                  >
                    <Music className="h-4 w-4 mr-1" />
                    {showHarmonies ? 'Hide' : 'Show'} Harmonies
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              )}
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
                  __html: renderSongContent() 
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
