import { useState, useEffect, useCallback } from 'react';
import { Song } from '@shared/schema';

interface FolderLibraryState {
  isConnected: boolean;
  folderName: string | null;
  isSupported: boolean;
  isLoading: boolean;
  lastSyncTime: Date | null;
}

export function useFolderLibrary() {
  const [state, setState] = useState<FolderLibraryState>({
    isConnected: false,
    folderName: null,
    isSupported: 'showDirectoryPicker' in window,
    isLoading: false,
    lastSyncTime: null
  });

  // Load saved folder handle from localStorage
  useEffect(() => {
    const loadSavedFolder = async () => {
      try {
        const savedHandle = localStorage.getItem('songFolderHandle');
        const folderName = localStorage.getItem('songFolderName');
        
        if (savedHandle && folderName) {
          // Try to restore the folder handle
          const handle = JSON.parse(savedHandle);
          if (handle && handle.kind === 'directory') {
            setState(prev => ({
              ...prev,
              isConnected: true,
              folderName: folderName
            }));
          }
        }
      } catch (error) {
        console.log('Could not restore folder connection:', error);
        // Clear invalid data
        localStorage.removeItem('songFolderHandle');
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

      // Save the handle and folder name
      localStorage.setItem('songFolderHandle', JSON.stringify(directoryHandle));
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
    localStorage.removeItem('songFolderHandle');
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

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const savedHandle = localStorage.getItem('songFolderHandle');
      if (!savedHandle) {
        throw new Error('Folder handle not found');
      }

      const directoryHandle = JSON.parse(savedHandle);
      
      // Request permission to access the directory
      const permission = await directoryHandle.requestPermission({ mode: 'read' });
      if (permission !== 'granted') {
        throw new Error('Permission denied to access folder');
      }

      const songs: Song[] = [];
      
      // Read all markdown files from the directory
      for await (const [name, handle] of directoryHandle.entries()) {
        if (handle.kind === 'file' && (name.endsWith('.md') || name.endsWith('.txt'))) {
          try {
            const file = await handle.getFile();
            const content = await file.text();
            
            songs.push({
              id: Date.now() + Math.random(),
              name: name.replace(/\.(md|txt)$/, ''),
              content: content,
              duration: 0
            });
          } catch (error) {
            console.warn(`Could not read file ${name}:`, error);
          }
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncTime: new Date()
      }));

      return songs;

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [state.isConnected]);

  return {
    state,
    connectFolder,
    disconnectFolder,
    syncSongs
  };
}