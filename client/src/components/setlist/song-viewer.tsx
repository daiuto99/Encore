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
  const [showHighHarmony, setShowHighHarmony] = useState(true);
  const [showLowHarmony, setShowLowHarmony] = useState(true);
  
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
    
    // Determine if lyrics-only mode should be active
    const isLyricsOnly = state.globalLyricsOnly || 
      (currentSong && state.sets[state.currentSetIndex]?.songLyricsOnly?.[currentSong.id.toString()]);

    // Process content for lyrics-only mode first
    let processedContent = currentSong.content;
    
    if (isLyricsOnly) {
      // More comprehensive chord removal for lyrics-only mode
      processedContent = processedContent
        .replace(/\[[A-G][#b]?[^[\]]*\]/g, '') // Remove chord symbols like [C], [Am7], [Gsus4]
        .replace(/^[A-G][#b]?[^\s\n]*\s*/gm, '') // Remove lines starting with chord names
        .replace(/\b[A-G][#b]?[^\s\n]*(?=\s|$)/g, '') // Remove isolated chord symbols
        .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
        .replace(/^\s+/gm, '') // Remove leading whitespace
        .trim();
    }
    
    // Handle harmony display based on individual toggle states
    if (showHighHarmony) {
      processedContent = processedContent
        .replace(/\{harmony-high\}([\s\S]*?)\{\/harmony-high\}/g, '<span class="harmony-high">$1</span>');
    } else {
      processedContent = processedContent
        .replace(/\{harmony-high\}([\s\S]*?)\{\/harmony-high\}/g, '$1');
    }
    
    if (showLowHarmony) {
      processedContent = processedContent
        .replace(/\{harmony-low\}([\s\S]*?)\{\/harmony-low\}/g, '<span class="harmony-low">$1</span>');
    } else {
      processedContent = processedContent
        .replace(/\{harmony-low\}([\s\S]*?)\{\/harmony-low\}/g, '$1');
    }
    
    // Always handle legacy harmony tags
    processedContent = processedContent
      .replace(/\{harmony\}([\s\S]*?)\{\/harmony\}/g, '<span class="harmony-highlight">$1</span>');
    
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
          <div className="space-y-3">
            <div className="flex items-center">
              <CardTitle className="flex items-center flex-1">
                <Eye className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                <span className="truncate">{currentSong ? currentSong.name : 'No song selected'}</span>
                {currentSong?.isModified && (
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs flex-shrink-0">
                    Modified
                  </Badge>
                )}
              </CardTitle>
            </div>
            
            {currentSong && (
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex-shrink-0"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant={showHighHarmony ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHighHarmony(!showHighHarmony)}
                  className="flex-shrink-0"
                  title="Toggle High Harmony Display (↑)"
                >
                  High
                </Button>
                
                <Button
                  variant={showLowHarmony ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLowHarmony(!showLowHarmony)}
                  className="flex-shrink-0"
                  title="Toggle Low Harmony Display (↓)"
                >
                  Low
                </Button>
                
                <Button
                  variant={state.globalLyricsOnly ? "default" : "outline"}
                  size="sm"
                  onClick={actions.toggleGlobalLyricsOnly}
                  className="flex-shrink-0"
                  title="Toggle Lyrics Only Mode"
                >
                  <span className="text-xs">Lyrics</span>
                </Button>
                
                {state.selectedPreviewSong && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actions.selectPreviewSong(null)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Exit Preview
                  </Button>
                )}
              </div>
            )}
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
