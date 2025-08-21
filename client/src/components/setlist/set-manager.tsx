import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { List, Plus, Trash2, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';
import { AppState } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { getSetColor, getSetColorClasses } from '@/lib/set-colors';

interface SetManagerProps {
  state: AppState;
  actions: any;
}

export default function SetManager({ state, actions }: SetManagerProps) {
  const { toast } = useToast();
  const currentSet = state.sets[state.currentSetIndex];
  
  const handleSongDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'song', index }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback for touch devices
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleSongDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleSongDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSongDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.type === 'song' && data.index !== dropIndex) {
      actions.reorderSongs(data.index, dropIndex);
      toast({
        title: 'Song Reordered',
        description: `Moved song to position ${dropIndex + 1}`,
      });
    }
  };
  
  const handleDeleteSet = () => {
    if (state.sets.length <= 1) {
      toast({
        title: 'Error',
        description: 'Cannot delete the last remaining set',
        variant: 'destructive'
      });
      return;
    }
    actions.removeSet(state.currentSetIndex);
  };

  const progressPercent = currentSet.songs.length > 0 
    ? ((Math.max(0, state.currentSongIndex + 1)) / currentSet.songs.length) * 100 
    : 0;

  return (
    <Card data-testid="card-set-manager">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Sets
          </CardTitle>
          <Button 
            size="sm"
            onClick={actions.addSet}
            data-testid="button-add-set"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Set
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Set Tabs */}
        <div className="flex space-x-1 mb-6 overflow-x-auto custom-scrollbar" data-testid="tabs-sets">
          {state.sets.map((set, index) => {
            const setColor = getSetColor(index);
            const isActive = index === state.currentSetIndex;
            const tabClasses = isActive 
              ? `whitespace-nowrap min-w-[80px] ${getSetColorClasses(setColor, 'dark')}`
              : `whitespace-nowrap min-w-[80px] border ${getSetColorClasses(setColor, 'light')}`;
            
            return (
              <Button
                key={set.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => actions.switchToSet(index)}
                className={tabClasses}
                data-testid={`button-set-tab-${index}`}
              >
                {set.name} ({set.songs.length})
              </Button>
            );
          })}
        </div>
        
        {/* Current Set Info */}
        <div className="flex items-center justify-between mb-4">
          <Input 
            value={currentSet.name}
            onChange={(e) => actions.updateSetName(state.currentSetIndex, e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:bg-muted/50 rounded px-2 py-1 flex-1"
            data-testid="input-current-set-name"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={state.sets.length <= 1}
                data-testid="button-delete-set"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-testid="dialog-delete-set">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Set</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{currentSet.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteSet}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span data-testid="text-progress">
              {Math.max(0, state.currentSongIndex + 1)} of {currentSet.songs.length}
            </span>
            <span data-testid="text-progress-time">0:00</span>
          </div>
          <Progress value={progressPercent} className="w-full" data-testid="progress-bar" />
        </div>
        
        {/* Set Songs */}
        <div className="space-y-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: '50vh' }} data-testid="list-set-songs">
          {currentSet.songs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <List className="mx-auto h-8 w-8 mb-2" />
              <p>No songs in this set</p>
              <p className="text-sm">Add songs from Available Songs</p>
            </div>
          ) : (
            currentSet.songs.map((song, index) => {
              const isSelected = index === state.currentSongIndex;
              const setColor = getSetColor(state.currentSetIndex);
              const songClasses = isSelected 
                ? `flex items-center p-3 rounded-md border transition-colors cursor-pointer ${getSetColorClasses(setColor, 'medium')}`
                : `flex items-center p-3 rounded-md border transition-colors cursor-pointer ${getSetColorClasses(setColor, 'light')} hover:opacity-80`;
              
              return (
                <div 
                  key={`${song.id}-${index}`}
                  className={songClasses}
                  onClick={() => actions.selectSong(index)}
                  draggable
                  onDragStart={(e) => handleSongDragStart(e, index)}
                  onDragEnd={handleSongDragEnd}
                  onDragOver={handleSongDragOver}
                  onDrop={(e) => handleSongDrop(e, index)}
                  data-testid={`item-set-song-${index}`}
                  style={{ touchAction: 'none' }}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mr-2 cursor-move" />
                    <span className="text-sm text-muted-foreground font-mono mr-2" data-testid={`text-song-number-${index}`}>
                      {index + 1}.
                    </span>
                    <h4 className="font-medium text-foreground truncate" data-testid={`text-set-song-name-${index}`}>
                      {song.name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.reorderSongs(index, Math.max(0, index - 1));
                      }}
                      disabled={index === 0}
                      className="h-6 w-6"
                      data-testid={`button-move-up-${index}`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.reorderSongs(index, Math.min(currentSet.songs.length - 1, index + 1));
                      }}
                      disabled={index === currentSet.songs.length - 1}
                      className="h-6 w-6"
                      data-testid={`button-move-down-${index}`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.removeSongFromCurrentSet(index);
                      }}
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      data-testid={`button-remove-song-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
