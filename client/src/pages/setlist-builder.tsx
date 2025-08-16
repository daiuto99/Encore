import { useEffect } from 'react';
import { useSetlistState } from '@/hooks/use-setlist-state';
import { useFolderLibrary } from '@/hooks/use-folder-library';
import { useToast } from '@/hooks/use-toast';
import UploadZone from '@/components/setlist/upload-zone';
import AvailableSongs from '@/components/setlist/available-songs';
import SetManager from '@/components/setlist/set-manager';
import SongViewer from '@/components/setlist/song-viewer';
import PerformanceMode from '@/components/setlist/performance-mode';
import FolderLibrary from '@/components/setlist/folder-library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Play, Pause, Download, Upload, Minus, Plus } from 'lucide-react';
import { exportSetlist, loadSetlist } from '@/lib/export-utils';
import { Song } from '@shared/schema';

export default function SetlistBuilder() {
  const { state, actions } = useSetlistState();
  const { getFolderHandle } = useFolderLibrary();
  const { toast } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actions.navigateSong(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        actions.navigateSong(1);
      } else if (e.key === 'Escape' && state.isPerformanceMode) {
        e.preventDefault();
        actions.togglePerformanceMode();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [state.isPerformanceMode, actions]);

  const handleExport = async () => {
    try {
      const folderHandle = getFolderHandle();
      await exportSetlist(state, folderHandle);
      
      if (folderHandle) {
        toast({
          title: 'Success',
          description: 'Setlist saved to your connected folder in the "sets" directory',
        });
      } else {
        toast({
          title: 'Success', 
          description: 'Setlist exported successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export setlist',
        variant: 'destructive',
      });
    }
  };

  const handleLoad = async (file: File) => {
    try {
      console.log('Loading setlist file:', file.name);
      const loadedState = await loadSetlist(file);
      console.log('Loaded state from file:', loadedState);
      
      actions.loadState(loadedState);
      
      toast({
        title: 'Success',
        description: `Setlist "${loadedState.setlistName}" loaded successfully`,
      });
    } catch (error) {
      console.error('Error loading setlist:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load setlist file',
        variant: 'destructive',
      });
    }
  };

  const handleFolderSongsLoaded = (songs: Song[]) => {
    // Replace all songs with the new ones from folder
    actions.setState(prev => ({
      ...prev,
      allSongs: songs
    }));
  };

  const handleSongUpdate = (updatedSong: Song) => {
    actions.updateSong(updatedSong);
    toast({
      title: 'Song Updated',
      description: `"${updatedSong.name}" has been saved successfully`,
    });
  };

  const handleSyncToFolder = async (song: Song): Promise<void> => {
    const folderHandle = getFolderHandle();
    if (!folderHandle) {
      throw new Error('No folder connected');
    }

    try {
      // Request permission to write to the directory
      const permission = await folderHandle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        throw new Error('Permission denied to write to folder');
      }

      // Create the updated file content
      const filename = `${song.name.replace(/[^\w\s]/gi, '_')}.md`;
      const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(song.content);
      await writable.close();

      toast({
        title: 'Synced to Folder',
        description: `"${song.name}" has been saved to your connected folder`,
      });
    } catch (error) {
      console.error('Failed to sync to folder:', error);
      throw error;
    }
  };

  if (state.isPerformanceMode) {
    return <PerformanceMode state={state} actions={actions} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-200">
      {/* Header */}
      <header className="bg-card shadow-sm border-b no-print" data-testid="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Input
                value={state.setlistName}
                onChange={(e) => actions.setSetlistName(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none focus:bg-muted/50 rounded px-2 py-1 min-w-[200px]"
                data-testid="input-setlist-name"
              />
              {state.exportDate && (
                <span className="text-sm text-muted-foreground" data-testid="text-export-date">
                  {new Date(state.exportDate).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Font Size Controls */}
              <div className="flex items-center space-x-1">
                <Button 
                  size="icon"
                  variant="outline"
                  onClick={() => actions.setFontSize(state.fontSize - 10)}
                  data-testid="button-font-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center" data-testid="text-font-size">
                  {state.fontSize}%
                </span>
                <Button 
                  size="icon"
                  variant="outline"
                  onClick={() => actions.setFontSize(state.fontSize + 10)}
                  data-testid="button-font-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Dark Mode Toggle */}
              <Button 
                size="icon"
                variant="outline"
                onClick={actions.toggleDarkMode}
                data-testid="button-dark-mode-toggle"
              >
                {state.isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Performance Mode Toggle */}
              <Button 
                onClick={actions.togglePerformanceMode}
                data-testid="button-performance-mode-toggle"
              >
                <Play className="h-4 w-4 mr-2" />
                Performance Mode
              </Button>

              {/* Save/Load Controls */}
              <div className="flex items-center space-x-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                  onClick={handleExport}
                  data-testid="button-save-setlist"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" className="bg-secondary hover:bg-secondary/90" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Load
                    </span>
                  </Button>
                  <input 
                    type="file" 
                    accept=".html" 
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleLoad(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    data-testid="input-load-setlist"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Compact Top Section: Folder Library + Upload Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <FolderLibrary onSongsLoaded={handleFolderSongsLoaded} />
            <UploadZone onSongsUploaded={actions.addSongs} />
          </div>

          {/* Main Working Area: Available Songs + Sets (maximized space) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" style={{ minHeight: '60vh' }}>
            {/* Available Songs - Full Height */}
            <div className="flex flex-col">
              <AvailableSongs 
                songs={state.allSongs}
                sets={state.sets}
                currentSetIndex={state.currentSetIndex}
                onAddToSet={actions.addSongToCurrentSet}
              />
            </div>

            {/* Sets - Full Height */}
            <div className="flex flex-col">
              <SetManager 
                state={state}
                actions={actions}
              />
            </div>
          </div>

          {/* Song Viewer - Below main area */}
          <div className="border-t pt-6">
            <SongViewer 
              state={state}
              actions={actions}
              onSongUpdate={handleSongUpdate}
              onSyncToFolder={handleSyncToFolder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
