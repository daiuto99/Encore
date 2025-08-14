import { AppState } from '@shared/schema';
import { embeddedMarkdownParser } from './markdown-parser';

export async function exportSetlist(state: AppState, folderHandle?: any): Promise<void> {
  const exportData = {
    ...state,
    exportDate: new Date().toISOString()
  };
  
  // Create the complete HTML file with embedded state and app code
  const html = await createPortableHTML(exportData);
  const filename = `${state.setlistName.replace(/[^\w\s]/gi, '_')}_Setlist.html`;
  
  // If folder handle is provided, try to save to connected folder
  if (folderHandle && 'showDirectoryPicker' in window) {
    try {
      await saveToConnectedFolder(html, filename, folderHandle);
      return;
    } catch (error) {
      console.warn('Could not save to connected folder, falling back to download:', error);
      // Fall through to regular download
    }
  }
  
  // Fallback: Create regular download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function saveToConnectedFolder(html: string, filename: string, folderHandle: any): Promise<void> {
  // Request permission to write to the directory
  const permission = await folderHandle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    throw new Error('Permission denied to write to folder');
  }

  // Get or create the "sets" subdirectory
  let setsFolder;
  try {
    setsFolder = await folderHandle.getDirectoryHandle('sets');
  } catch (error) {
    // Folder doesn't exist, create it
    setsFolder = await folderHandle.getDirectoryHandle('sets', { create: true });
  }

  // Create the file in the sets folder
  const fileHandle = await setsFolder.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(html);
  await writable.close();
}

async function createPortableHTML(data: AppState): Promise<string> {
  // Get the current document HTML
  const currentHTML = document.documentElement.outerHTML;
  
  // Create data script
  const dataScript = `<script type="application/json" id="setlist-data">${JSON.stringify(data)}</script>`;
  
  // Embed the markdown parser
  const parserScript = `<script>${embeddedMarkdownParser}</script>`;
  
  // Insert scripts before closing body tag
  const htmlWithData = currentHTML
    .replace('</body>', `${dataScript}${parserScript}</body>`)
    // Remove development scripts and replace with production note
    .replace(/<script.*replit.*<\/script>/g, '')
    .replace(/<script.*vite.*<\/script>/g, '')
    .replace(/\/src\/main\.tsx.*"/g, '"# Offline Setlist - No external dependencies needed"');
  
  return htmlWithData;
}

export async function loadSetlist(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const htmlContent = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const dataScript = doc.getElementById('setlist-data');
        
        if (!dataScript) {
          throw new Error('No setlist data found in file');
        }
        
        const loadedState = JSON.parse(dataScript.textContent || '{}');
        
        // Validate the loaded state
        if (!loadedState.sets || !Array.isArray(loadedState.sets) || loadedState.sets.length === 0) {
          throw new Error('Invalid setlist format');
        }
        
        resolve(loadedState);
        
      } catch (error) {
        console.error('Error loading setlist:', error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
