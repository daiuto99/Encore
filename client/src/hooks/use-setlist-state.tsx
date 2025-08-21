import { useState, useEffect } from 'react';
import { AppState, Song, Set } from '@shared/schema';
import { getSetColor } from '@/lib/set-colors';

const initialState: AppState = {
  setlistName: 'My Setlist',
  allSongs: [],
  sets: [
    { id: 1, name: 'Set 1', songs: [], color: 'blue' }
  ],
  currentSetIndex: 0,
  currentSongIndex: -1,
  fontSize: 100,
  isDarkMode: false,
  isPerformanceMode: false
};

export function useSetlistState() {
  const [state, setState] = useState<AppState>(() => {
    // Check for embedded data on initial load
    const embeddedData = document.getElementById('setlist-data');
    if (embeddedData) {
      try {
        return JSON.parse(embeddedData.textContent || '{}');
      } catch (error) {
        console.error('Error loading embedded data:', error);
      }
    }
    return initialState;
  });

  // Apply theme changes to document
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Apply font size changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${state.fontSize / 100}em`);
  }, [state.fontSize]);

  // Apply performance mode class
  useEffect(() => {
    if (state.isPerformanceMode) {
      document.body.classList.add('performance-mode');
      // Try to enable wake lock
      if ('wakeLock' in navigator) {
        try {
          (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.log('Wake lock not supported or failed:', err);
        }
      }
    } else {
      document.body.classList.remove('performance-mode');
    }
  }, [state.isPerformanceMode]);

  const actions = {
    setState,
    
    setSetlistName: (name: string) => {
      setState(prev => ({ ...prev, setlistName: name }));
    },

    addSongs: (songs: Omit<Song, 'id'>[]) => {
      const newSongs = songs.map(song => ({
        ...song,
        id: Date.now() + Math.random()
      }));
      setState(prev => ({
        ...prev,
        allSongs: [...prev.allSongs, ...newSongs]
      }));
    },

    addSongToCurrentSet: (song: Song) => {
      setState(prev => {
        const currentSet = prev.sets[prev.currentSetIndex];
        const songCopy = { ...song };
        
        const updatedSets = [...prev.sets];
        updatedSets[prev.currentSetIndex] = {
          ...currentSet,
          songs: [...currentSet.songs, songCopy]
        };
        
        return { ...prev, sets: updatedSets };
      });
    },

    removeSongFromCurrentSet: (songIndex: number) => {
      setState(prev => {
        const currentSet = prev.sets[prev.currentSetIndex];
        const updatedSets = [...prev.sets];
        updatedSets[prev.currentSetIndex] = {
          ...currentSet,
          songs: currentSet.songs.filter((_, index) => index !== songIndex)
        };
        
        // Adjust current song index if necessary
        let newCurrentSongIndex = prev.currentSongIndex;
        if (songIndex === prev.currentSongIndex) {
          newCurrentSongIndex = -1;
        } else if (songIndex < prev.currentSongIndex) {
          newCurrentSongIndex = prev.currentSongIndex - 1;
        }
        
        return { 
          ...prev,
          sets: updatedSets,
          currentSongIndex: newCurrentSongIndex
        };
      });
    },

    reorderSongs: (fromIndex: number, toIndex: number) => {
      setState(prev => {
        const currentSet = prev.sets[prev.currentSetIndex];
        const songs = [...currentSet.songs];
        const [movedSong] = songs.splice(fromIndex, 1);
        songs.splice(toIndex, 0, movedSong);
        
        const updatedSets = [...prev.sets];
        updatedSets[prev.currentSetIndex] = {
          ...currentSet,
          songs: songs
        };
        
        // Adjust current song index
        let newCurrentSongIndex = prev.currentSongIndex;
        if (fromIndex === prev.currentSongIndex) {
          newCurrentSongIndex = toIndex;
        } else if (fromIndex < prev.currentSongIndex && toIndex >= prev.currentSongIndex) {
          newCurrentSongIndex = prev.currentSongIndex - 1;
        } else if (fromIndex > prev.currentSongIndex && toIndex <= prev.currentSongIndex) {
          newCurrentSongIndex = prev.currentSongIndex + 1;
        }
        
        return { 
          ...prev,
          sets: updatedSets,
          currentSongIndex: newCurrentSongIndex
        };
      });
    },

    addSet: () => {
      setState(prev => {
        const newSet: Set = {
          id: Date.now(),
          name: `Set ${prev.sets.length + 1}`,
          songs: [],
          color: getSetColor(prev.sets.length)
        };
        return {
          ...prev,
          sets: [...prev.sets, newSet]
        };
      });
    },

    removeSet: (setIndex: number) => {
      setState(prev => {
        if (prev.sets.length <= 1) return prev;
        
        const updatedSets = prev.sets.filter((_, index) => index !== setIndex);
        let newCurrentSetIndex = prev.currentSetIndex;
        
        if (setIndex === prev.currentSetIndex) {
          newCurrentSetIndex = Math.max(0, setIndex - 1);
        } else if (setIndex < prev.currentSetIndex) {
          newCurrentSetIndex = prev.currentSetIndex - 1;
        }
        
        return {
          ...prev,
          sets: updatedSets,
          currentSetIndex: newCurrentSetIndex,
          currentSongIndex: -1
        };
      });
    },

    switchToSet: (setIndex: number) => {
      setState(prev => ({
        ...prev,
        currentSetIndex: setIndex,
        currentSongIndex: -1
      }));
    },

    updateSetName: (setIndex: number, name: string) => {
      setState(prev => {
        const updatedSets = [...prev.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          name
        };
        return { ...prev, sets: updatedSets };
      });
    },

    selectSong: (songIndex: number) => {
      setState(prev => ({ ...prev, currentSongIndex: songIndex }));
    },

    navigateSong: (direction: number) => {
      setState(prev => {
        const currentSet = prev.sets[prev.currentSetIndex];
        if (!currentSet || currentSet.songs.length === 0) return prev;
        
        let newIndex = prev.currentSongIndex + direction;
        newIndex = Math.max(0, Math.min(currentSet.songs.length - 1, newIndex));
        
        return { ...prev, currentSongIndex: newIndex };
      });
    },

    setFontSize: (size: number) => {
      const clampedSize = Math.max(50, Math.min(200, size));
      setState(prev => ({ ...prev, fontSize: clampedSize }));
    },

    toggleDarkMode: () => {
      setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    },

    togglePerformanceMode: () => {
      setState(prev => {
        const newPerformanceMode = !prev.isPerformanceMode;
        const currentSet = prev.sets[prev.currentSetIndex];
        
        // When entering performance mode, automatically start on first song if there are songs
        let newSongIndex = prev.currentSongIndex;
        if (newPerformanceMode && currentSet && currentSet.songs.length > 0 && prev.currentSongIndex === -1) {
          newSongIndex = 0;
        }
        
        return { 
          ...prev, 
          isPerformanceMode: newPerformanceMode,
          currentSongIndex: newSongIndex
        };
      });
    },

    loadState: (newState: AppState) => {
      try {
        // Validate the new state has required properties
        if (!newState || typeof newState !== 'object') {
          throw new Error('Invalid state object');
        }
        
        if (!newState.setlistName || !Array.isArray(newState.allSongs) || !Array.isArray(newState.sets)) {
          throw new Error('Missing required state properties');
        }
        
        // Simply use the loaded data as-is - the issue is in the UI matching logic
        const finalAllSongs = newState.allSongs;
        const normalizedSets = newState.sets;
        
        // Ensure required properties exist with defaults
        const validatedState: AppState = {
          setlistName: newState.setlistName || 'Imported Setlist',
          allSongs: finalAllSongs,
          sets: normalizedSets.length > 0 ? normalizedSets : [{ id: 1, name: 'Set 1', songs: [], color: 'blue' }],
          currentSetIndex: Math.max(0, Math.min(newState.currentSetIndex || 0, (normalizedSets?.length || 1) - 1)),
          currentSongIndex: newState.currentSongIndex || -1,
          fontSize: newState.fontSize || 100,
          isDarkMode: newState.isDarkMode || false,
          isPerformanceMode: false // Always start in normal mode
        };
        

        setState(validatedState);
      } catch (error) {
        console.error('Error loading state:', error);
        throw new Error('Failed to load setlist: ' + (error as Error).message);
      }
    },

    updateSong: (updatedSong: Song) => {
      setState(prev => {
        // Update in allSongs
        const updatedAllSongs = prev.allSongs.map(song => 
          song.id === updatedSong.id ? updatedSong : song
        );
        
        // Update in all sets
        const updatedSets = prev.sets.map(set => ({
          ...set,
          songs: set.songs.map(song => 
            song.id === updatedSong.id ? updatedSong : song
          )
        }));
        
        // Update selected preview song if it matches
        const updatedPreviewSong = prev.selectedPreviewSong?.id === updatedSong.id 
          ? updatedSong 
          : prev.selectedPreviewSong;
        
        return {
          ...prev,
          allSongs: updatedAllSongs,
          sets: updatedSets,
          selectedPreviewSong: updatedPreviewSong
        };
      });
    },

    selectPreviewSong: (song: Song | null) => {
      setState(prev => ({
        ...prev,
        selectedPreviewSong: song
      }));
    },



    deleteSong: (songId: number) => {
      setState(prev => {
        // Remove from allSongs
        const updatedAllSongs = prev.allSongs.filter(song => song.id !== songId);
        
        // Remove from all sets
        const updatedSets = prev.sets.map(set => ({
          ...set,
          songs: set.songs.filter(song => song.id !== songId)
        }));
        
        // Clear preview if it was the deleted song
        const updatedPreviewSong = prev.selectedPreviewSong?.id === songId 
          ? null 
          : prev.selectedPreviewSong;
        
        // Adjust current song index if needed
        const currentSet = updatedSets[prev.currentSetIndex];
        let newCurrentSongIndex = prev.currentSongIndex;
        
        if (currentSet && prev.currentSongIndex >= currentSet.songs.length) {
          newCurrentSongIndex = Math.max(0, currentSet.songs.length - 1);
        }
        
        return {
          ...prev,
          allSongs: updatedAllSongs,
          sets: updatedSets,
          selectedPreviewSong: updatedPreviewSong,
          currentSongIndex: newCurrentSongIndex
        };
      });
    }
  };

  return { state, actions };
}
