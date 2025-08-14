import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Search } from 'lucide-react';
import { Song, Set } from '@shared/schema';

interface AvailableSongsProps {
  songs: Song[];
  sets: Set[];
  currentSetIndex: number;
  onAddToSet: (song: Song) => void;
}

export default function AvailableSongs({ 
  songs, 
  sets, 
  currentSetIndex, 
  onAddToSet 
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
            Available Songs
          </CardTitle>
          <span className="text-sm text-muted-foreground" data-testid="text-song-count">
            {songs.length} songs
          </span>
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
        <div className="space-y-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: '60vh' }} data-testid="list-available-songs">
          {filteredSongs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Music className="mx-auto h-8 w-8 mb-2" />
              <p>{songs.length === 0 ? 'No songs uploaded yet' : 'No songs match your search'}</p>
              <p className="text-sm">{songs.length === 0 ? 'Upload .md or .txt files to get started' : 'Try a different search term'}</p>
            </div>
          ) : (
            filteredSongs.map(song => {
              const songInSet = isSongInAnySet(song.id);
              const buttonText = songInSet.inSet ? `In ${songInSet.setName}` : 'Add to Set';
              const buttonDisabled = songInSet.inSet && songInSet.setIndex === currentSetIndex;
              
              return (
                <div key={song.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors" data-testid={`item-song-${song.id}`}>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate" data-testid={`text-song-name-${song.id}`}>
                      {song.name}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate" data-testid={`text-song-preview-${song.id}`}>
                      {song.content.substring(0, 100)}...
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    variant={buttonDisabled ? "outline" : "default"}
                    onClick={() => !buttonDisabled && onAddToSet(song)}
                    disabled={buttonDisabled}
                    className="ml-3"
                    data-testid={`button-add-song-${song.id}`}
                  >
                    {buttonText}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
