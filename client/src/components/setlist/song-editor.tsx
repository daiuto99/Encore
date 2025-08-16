import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Music, 
  FileText,
  Undo,
  RefreshCw 
} from 'lucide-react';
import { Song } from '@shared/schema';
import { parseMarkdown } from '@/lib/markdown-parser';

interface SongEditorProps {
  song: Song;
  onSave: (updatedSong: Song) => void;
  onCancel: () => void;
  onSyncToFolder?: (song: Song) => Promise<void>;
}

export default function SongEditor({ song, onSave, onCancel, onSyncToFolder }: SongEditorProps) {
  const [content, setContent] = useState(song.content);
  const [showPreview, setShowPreview] = useState(false);
  const [showHarmonies, setShowHarmonies] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const hasChanges = content !== song.content;
  const isModified = song.isModified || hasChanges;

  const handleSave = async () => {
    const updatedSong: Song = {
      ...song,
      content,
      originalContent: song.originalContent || song.content,
      isModified: content !== (song.originalContent || song.content),
      lastModified: new Date().toISOString()
    };

    onSave(updatedSong);

    // Try to sync to folder if available
    if (onSyncToFolder && updatedSong.isModified) {
      try {
        setIsSyncing(true);
        await onSyncToFolder(updatedSong);
      } catch (error) {
        console.warn('Could not sync to folder:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleRevert = () => {
    setContent(song.originalContent || song.content);
  };

  const handleMarkAsHarmony = () => {
    if (!selectedText) return;
    
    const newContent = content.replace(selectedText, `{harmony}${selectedText}{/harmony}`);
    setContent(newContent);
    setSelectedText('');
  };

  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    setSelectedText(selected.trim());
  };

  const renderPreview = () => {
    // Enhanced markdown parser that handles harmony syntax
    const processedContent = showHarmonies 
      ? content.replace(
          /\{harmony\}(.*?)\{\/harmony\}/g, 
          '<span class="harmony-line">🎵 $1</span>'
        )
      : content.replace(/\{harmony\}(.*?)\{\/harmony\}/g, '$1');
    
    return parseMarkdown(processedContent);
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Edit: {song.name}
              </CardTitle>
              {isModified && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Modified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHarmonies(!showHarmonies)}
                disabled={!showPreview}
              >
                <Music className="h-4 w-4 mr-1" />
                {showHarmonies ? 'Hide' : 'Show'} Harmonies
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedText && (
              <Button
                size="sm"
                onClick={handleMarkAsHarmony}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Music className="h-4 w-4 mr-1" />
                Mark as Harmony
              </Button>
            )}
            
            {hasChanges && song.originalContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevert}
              >
                <Undo className="h-4 w-4 mr-1" />
                Revert Changes
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              💡 Tip: Select text and click "Mark as Harmony" to highlight vocal parts
            </div>
          </div>
          
          {/* Editor/Preview Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            {!showPreview && (
              <div className="lg:col-span-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onSelect={handleTextSelection}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Enter song content with chords and lyrics..."
                />
              </div>
            )}
            
            {/* Preview */}
            {showPreview && (
              <div className="lg:col-span-2">
                <div 
                  className="min-h-[500px] p-4 border rounded-md bg-muted/20 song-viewer"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {onSyncToFolder && isModified && (
                <Button
                  variant="outline"
                  onClick={() => onSyncToFolder(song)}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync to Folder
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}