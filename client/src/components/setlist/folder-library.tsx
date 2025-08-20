import { useState } from 'react';
import { useFolderLibrary } from '@/hooks/use-folder-library';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderOpen, RefreshCw, Unlink, AlertCircle } from 'lucide-react';
import { Song } from '@shared/schema';

interface FolderLibraryProps {
  onSongsLoaded: (songs: Song[]) => void;
}

export default function FolderLibrary({ onSongsLoaded }: FolderLibraryProps) {
  const { state, connectFolder, disconnectFolder, syncSongs } = useFolderLibrary();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnectFolder = async () => {
    try {
      await connectFolder();
      toast({
        title: 'Folder Connected',
        description: 'Connected successfully! Loading your songs...',
      });
      
      // Automatically sync songs after connecting
      setTimeout(() => {
        handleSyncSongs();
      }, 500); // Small delay to let the connection settle
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: 'Connection Failed',
          description: error.message || 'Could not connect to folder',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSyncSongs = async () => {
    try {
      setIsSyncing(true);
      const songs = await syncSongs();
      onSongsLoaded(songs);
      
      if (songs.length === 0) {
        toast({
          title: 'No Songs Found',
          description: 'No .md or .txt files were found in your connected folder. Check the browser console for details.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sync Complete',
          description: `Loaded ${songs.length} song${songs.length !== 1 ? 's' : ''} from your folder`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Could not sync songs from folder',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    disconnectFolder();
    toast({
      title: 'Folder Disconnected',
      description: 'Your song folder has been disconnected',
    });
  };

  if (!state.isSupported) {
    const inIframe = window !== window.parent;
    const hasAPI = 'showDirectoryPicker' in window;
    const isIOSorSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) || /Safari/.test(navigator.userAgent);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            File Upload Only
          </CardTitle>
          <CardDescription>
            {isIOSorSafari ? (
              <>
                iPad/Safari: Folder sync not supported. Use drag & drop or the file chooser below to upload your songs. 
                Your setlists will export as downloadable files you can save to Files app.
              </>
            ) : inIframe ? (
              <>
                Folder access restricted in embedded view. Open in new tab for automatic folder sync, 
                or use drag & drop upload below.
              </>
            ) : !hasAPI ? (
              <>
                Your browser doesn't support automatic folder sync. Use drag & drop or file upload below. 
                Chrome/Edge offer automatic folder features.
              </>
            ) : (
              <>
                Folder sync unavailable. Use drag & drop or file upload below to add your songs.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            {!isIOSorSafari && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full"
                  data-testid="button-open-new-tab"
                >
                  Open in New Tab for Full Features
                </Button>
                <p className="text-xs text-muted-foreground">
                  New tab enables automatic folder sync and export
                </p>
              </>
            )}
            {isIOSorSafari && (
              <p className="text-xs text-muted-foreground">
                💡 Tip: Export your setlists to save them to your Files app for easy access
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-32 overflow-hidden">
      <CardHeader className="pb-1 px-3 pt-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {state.isConnected ? (
            <FolderOpen className="h-3 w-3 text-blue-500" />
          ) : (
            <Folder className="h-3 w-3" />
          )}
          Song Folder Library
          {state.isConnected && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 ml-auto text-xs">
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-2">
        {state.isConnected ? (
          <div className="space-y-1">
            <div>
              <p className="text-xs font-medium truncate">{state.folderName}</p>
              {state.lastSyncTime && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {new Date(state.lastSyncTime).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button 
                onClick={handleSyncSongs}
                disabled={isSyncing}
                size="sm"
                className="flex-1 h-6 text-xs px-2"
                data-testid="button-sync-songs"
              >
                <RefreshCw className={`mr-1 h-2 w-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="h-6 px-2"
                data-testid="button-disconnect-folder"
              >
                <Unlink className="h-2 w-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Connect to automatically load song files
            </p>
            <Button 
              onClick={handleConnectFolder}
              disabled={state.isLoading}
              size="sm"
              className="w-full h-6 text-xs px-2"
              data-testid="button-connect-folder"
            >
              <Folder className="mr-1 h-2 w-2" />
              {state.isLoading ? 'Connecting...' : 'Connect Folder'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}