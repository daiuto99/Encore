import { useState, useEffect } from 'react';
import { AppState, Song, Set } from '@shared/schema';

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
          color: ['blue', 'green', 'purple', 'orange'][prev.sets.length % 4]
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
      setState(newState);
    }
  };

  return { state, actions };
}
