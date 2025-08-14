import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudUpload, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Song } from '@shared/schema';

interface UploadZoneProps {
  onSongsUploaded: (songs: Omit<Song, 'id'>[]) => void;
}

export default function UploadZone({ onSongsUploaded }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const isValidFileType = (file: File) => {
    const validExtensions = ['.md', '.txt'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(isValidFileType);
    const invalidFiles = Array.from(files).filter(file => !isValidFileType(file));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Warning',
        description: `${invalidFiles.length} file(s) skipped - only .md and .txt files are allowed`,
        variant: 'destructive'
      });
    }
    
    if (validFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid files selected',
        variant: 'destructive'
      });
      return;
    }
    
    const promises = validFiles.map(file => {
      return new Promise<Omit<Song, 'id'>>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          const name = file.name.replace(/\.(md|txt)$/i, '');
          resolve({
            name: name,
            content: e.target?.result as string,
            duration: 0
          });
        };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });
    });
    
    Promise.all(promises)
      .then(songs => {
        onSongsUploaded(songs);
        toast({
          title: 'Success',
          description: `${songs.length} song(s) uploaded successfully`
        });
      })
      .catch(error => {
        console.error('Error reading files:', error);
        toast({
          title: 'Error',
          description: 'Error reading files',
          variant: 'destructive'
        });
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card data-testid="card-upload-zone">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudUpload className="mr-2 h-5 w-5 text-primary" />
          Upload Songs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver 
              ? 'drag-over' 
              : 'border-border hover:border-primary hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="zone-drag-drop"
        >
          <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Drag & drop .md or .txt files here</p>
          <p className="text-sm text-muted-foreground mb-4">or</p>
          <label>
            <Button 
              variant="default"
              asChild
              data-testid="button-choose-files"
            >
              <span>
                <FilePlus className="mr-2 h-4 w-4" />
                Choose Files
              </span>
            </Button>
            <input 
              type="file" 
              multiple 
              accept=".md,.txt" 
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              data-testid="input-file-upload"
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
