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
        description: 'Your song folder has been connected successfully',
      });
      
      // Automatically sync songs after connecting
      handleSyncSongs();
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
      
      toast({
        title: 'Sync Complete',
        description: `Loaded ${songs.length} song${songs.length !== 1 ? 's' : ''} from your folder`,
      });
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
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Folder Library Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support automatic folder access. You can still upload songs using drag & drop.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state.isConnected ? (
            <FolderOpen className="h-5 w-5 text-blue-500" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
          Song Folder Library
        </CardTitle>
        <CardDescription>
          Connect to a folder (like iCloud Drive) to automatically load your markdown song files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected to:</p>
                <p className="text-sm text-muted-foreground">{state.folderName}</p>
                {state.lastSyncTime && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {state.lastSyncTime.toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                Connected
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSyncSongs}
                disabled={isSyncing}
                className="flex-1"
                data-testid="button-sync-songs"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Songs'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleDisconnect}
                data-testid="button-disconnect-folder"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to your song folder to automatically load markdown files
            </p>
            <Button 
              onClick={handleConnectFolder}
              disabled={state.isLoading}
              data-testid="button-connect-folder"
            >
              <Folder className="mr-2 h-4 w-4" />
              {state.isLoading ? 'Connecting...' : 'Connect Folder'}
            </Button>
          </div>
        )}
        
        <div className="pt-2 border-t space-y-1">
          <p className="text-xs text-muted-foreground">
            Works with iCloud Drive, Google Drive, OneDrive, and local folders. 
            Requires Chrome, Edge, or other modern browsers.
          </p>
          {state.isConnected && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              💾 Setlist exports will automatically save to "{state.folderName}/sets/"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}