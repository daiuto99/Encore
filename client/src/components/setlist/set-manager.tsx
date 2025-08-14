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
import { List, Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { AppState } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface SetManagerProps {
  state: AppState;
  actions: any;
}

export default function SetManager({ state, actions }: SetManagerProps) {
  const { toast } = useToast();
  const currentSet = state.sets[state.currentSetIndex];
  
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
          {state.sets.map((set, index) => (
            <Button
              key={set.id}
              variant={index === state.currentSetIndex ? "default" : "outline"}
              size="sm"
              onClick={() => actions.switchToSet(index)}
              className="whitespace-nowrap min-w-[80px]"
              data-testid={`button-set-tab-${index}`}
            >
              {set.name}
            </Button>
          ))}
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
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar" data-testid="list-set-songs">
          {currentSet.songs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <List className="mx-auto h-8 w-8 mb-2" />
              <p>No songs in this set</p>
              <p className="text-sm">Add songs from Available Songs</p>
            </div>
          ) : (
            currentSet.songs.map((song, index) => {
              const isSelected = index === state.currentSongIndex;
              return (
                <div 
                  key={`${song.id}-${index}`}
                  className={`flex items-center p-3 rounded-md border transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                  onClick={() => actions.selectSong(index)}
                  data-testid={`item-set-song-${index}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground font-mono" data-testid={`text-song-number-${index}`}>
                        {index + 1}.
                      </span>
                      <h4 className="font-medium text-foreground truncate" data-testid={`text-set-song-name-${index}`}>
                        {song.name}
                      </h4>
                    </div>
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
