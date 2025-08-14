import { AppState } from '@shared/schema';
import { embeddedMarkdownParser } from './markdown-parser';

export async function exportSetlist(state: AppState): Promise<void> {
  const exportData = {
    ...state,
    exportDate: new Date().toISOString()
  };
  
  // Create the complete HTML file with embedded state and app code
  const html = await createPortableHTML(exportData);
  
  // Create download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.setlistName.replace(/[^\w\s]/gi, '_')}_Setlist.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
