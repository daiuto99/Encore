import { useState, useEffect, useCallback } from 'react';
import { Song } from '@shared/schema';

interface FolderLibraryState {
  isConnected: boolean;
  folderName: string | null;
  isSupported: boolean;
  isLoading: boolean;
  lastSyncTime: Date | null;
}

// Store the actual handle in memory, not localStorage
let globalFolderHandle: any = null;

export function useFolderLibrary() {
  const [state, setState] = useState<FolderLibraryState>(() => {
    // Check if we're in an iframe which blocks file system access
    const inIframe = window !== window.parent;
    const hasAPI = 'showDirectoryPicker' in window;
    
    return {
      isConnected: false,
      folderName: null,
      isSupported: hasAPI && !inIframe,
      isLoading: false,
      lastSyncTime: null
    };
  });

  // Load saved folder info from localStorage and sync with handle availability
  useEffect(() => {
    const loadSavedFolder = () => {
      try {
        const folderName = localStorage.getItem('songFolderName');
        
        // Only show as connected if we have both the name AND the handle
        if (folderName && globalFolderHandle) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            folderName: folderName
          }));
        } else if (folderName && !globalFolderHandle) {
          // We have the name but no handle - clear the stale connection
          setState(prev => ({
            ...prev,
            isConnected: false,
            folderName: null
          }));
          localStorage.removeItem('songFolderName');
        }
      } catch (error) {
        console.log('Could not restore folder connection:', error);
        localStorage.removeItem('songFolderName');
      }
    };

    if (state.isSupported) {
      loadSavedFolder();
    }
  }, [state.isSupported]);

  const connectFolder = useCallback(async (): Promise<void> => {
    if (!state.isSupported) {
      throw new Error('File System Access API is not supported in this browser');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Request directory access
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
        startIn: 'documents'
      });

      // Store the actual handle in memory (can't serialize to localStorage)
      globalFolderHandle = directoryHandle;
      
      // Only save the folder name to localStorage
      localStorage.setItem('songFolderName', directoryHandle.name);

      setState(prev => ({
        ...prev,
        isConnected: true,
        folderName: directoryHandle.name,
        isLoading: false
      }));

    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }, [state.isSupported]);

  const disconnectFolder = useCallback(() => {
    globalFolderHandle = null;
    localStorage.removeItem('songFolderName');
    setState(prev => ({
      ...prev,
      isConnected: false,
      folderName: null
    }));
  }, []);

  const syncSongs = useCallback(async (): Promise<Song[]> => {
    if (!state.isConnected) {
      throw new Error('No folder connected');
    }

    if (!globalFolderHandle) {
      throw new Error('Folder handle not available - please reconnect folder');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      console.log('Attempting to access directory:', globalFolderHandle);
      
      // Request permission to access the directory
      let permission;
      try {
        permission = await globalFolderHandle.requestPermission({ mode: 'read' });
        console.log('Permission result:', permission);
      } catch (permError: any) {
        console.error('Permission request failed:', permError);
        throw new Error('Could not request folder permission: ' + (permError.message || permError));
      }
      
      if (permission !== 'granted') {
        throw new Error('Permission denied to access folder');
      }

      const songs: Song[] = [];
      let fileCount = 0;
      let processedCount = 0;
      
      console.log('Starting to read directory entries...');
      
      // Read all markdown files from the directory
      try {
        for await (const [name, handle] of globalFolderHandle.entries()) {
          fileCount++;
          console.log(`Found entry: ${name}, kind: ${handle.kind}`);
          
          if (handle.kind === 'file' && (name.endsWith('.md') || name.endsWith('.txt'))) {
            try {
              console.log(`Processing file: ${name}`);
              const file = await handle.getFile();
              const content = await file.text();
              
              songs.push({
                id: Date.now() + Math.random() + processedCount,
                name: name.replace(/\.(md|txt)$/, ''),
                content: content,
                duration: 0,
                isModified: false
              });
              processedCount++;
              console.log(`Successfully processed: ${name}`);
            } catch (fileError) {
              console.warn(`Could not read file ${name}:`, fileError);
            }
          }
        }
      } catch (iterError: any) {
        console.error('Error iterating directory:', iterError);
        throw new Error('Failed to read folder contents: ' + (iterError.message || iterError));
      }

      console.log(`Sync complete: found ${fileCount} total entries, processed ${processedCount} song files`);

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncTime: new Date()
      }));

      return songs;

    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [state.isConnected]);

  const getFolderHandle = useCallback((): any | null => {
    return globalFolderHandle;
  }, []);

  return {
    state,
    connectFolder,
    disconnectFolder,
    syncSongs,
    getFolderHandle
  };
}