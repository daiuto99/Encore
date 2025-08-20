import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Music, Search, Trash2 } from 'lucide-react';
import { Song, Set } from '@shared/schema';
import { getSetColor, getSetColorClasses } from '@/lib/set-colors';

interface AvailableSongsProps {
  songs: Song[];
  sets: Set[];
  currentSetIndex: number;
  onAddToSet: (song: Song) => void;
  onSongSelect?: (song: Song) => void;
  onDeleteSong?: (songId: number) => void;
  selectedPreviewSong?: Song | null;
}

export default function AvailableSongs({ 
  songs, 
  sets, 
  currentSetIndex, 
  onAddToSet,
  onSongSelect,
  onDeleteSong,
  selectedPreviewSong
}: AvailableSongsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const isSongInAnySet = (songId: number) => {
    for (let i = 0; i < sets.length; i++) {
      if (sets[i].songs.some(song => song.id === songId)) {
        return { inSet: true, setIndex: i, setName: sets[i].name };
      }
    }
    return { inSet: false };
  };



  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.name.toLowerCase().includes(query) ||
      song.content.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <Card data-testid="card-available-songs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Music className="mr-2 h-5 w-5 text-primary" />
            Song Library
          </CardTitle>
          <div className="text-sm text-muted-foreground" data-testid="text-song-count">
            <div>{songs.length} total</div>
            <div>{songs.filter(song => !isSongInAnySet(song.id).inSet).length} available</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            data-testid="input-song-search"
          />
        </div>
        
        {/* Songs List */}
        <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-96" data-testid="list-available-songs">
          {filteredSongs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Music className="mx-auto h-8 w-8 mb-2" />
              <p>{songs.length === 0 ? 'No songs uploaded yet' : 'No songs match your search'}</p>
              <p className="text-sm">{songs.length === 0 ? 'Upload .md or .txt files to get started' : 'Try a different search term'}</p>
            </div>
          ) : (
            filteredSongs.map(song => {
              const songInSet = isSongInAnySet(song.id);
              const setColor = songInSet.inSet ? getSetColor(songInSet.setIndex!) : null;
              const cardClasses = songInSet.inSet && setColor
                ? `flex items-center justify-between p-3 rounded-md hover:opacity-80 transition-colors border ${getSetColorClasses(setColor, 'light')}`
                : 'flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors border border-border';
              
              const isSelected = selectedPreviewSong?.id === song.id;
              const clickableCardClasses = `${cardClasses} cursor-pointer ${
                isSelected ? 'ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10' : ''
              }`;
              
              return (
                <div 
                  key={song.id} 
                  className={clickableCardClasses} 
                  onClick={() => onSongSelect?.(song)}
                  data-testid={`item-song-${song.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate" data-testid={`text-song-name-${song.id}`}>
                        {song.name}
                      </h4>
                      {song.isModified && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                          Modified
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                          Previewing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {songInSet.inSet && setColor ? (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-3 py-1 ${getSetColorClasses(setColor, 'medium')}`}
                        data-testid={`badge-set-${song.id}`}
                      >
                        Set {songInSet.setIndex! + 1}
                      </Badge>
                    ) : (
                      <Button 
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent song selection when clicking button
                          onAddToSet(song);
                        }}
                        data-testid={`button-add-song-${song.id}`}
                      >
                        Add to Set
                      </Button>
                    )}
                    
                    {onDeleteSong && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            data-testid={`button-delete-song-${song.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Song</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{song.name}"? This will remove it from your library and all sets. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteSong(song.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
