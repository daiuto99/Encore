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
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-touch-fullscreen" content="yes" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <title>${data.setlistName} - Setlist</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -webkit-backface-visibility: hidden;
            -webkit-transform: translate3d(0,0,0);
            touch-action: manipulation;
            font-size: 16px;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; color: #3b82f6; }
        .header p { color: #64748b; font-size: 1.1rem; }
        .sets { display: grid; gap: 20px; }
        .set { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .set-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .set-title { font-size: 1.5rem; font-weight: 600; }
        .set-count { background: #e2e8f0; color: #475569; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; }
        .songs { display: grid; gap: 8px; }
        .song { padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; cursor: pointer; transition: all 0.2s; }
        .song:hover { background: #e2e8f0; }
        .song-name { font-weight: 500; margin-bottom: 4px; }
        .song-duration { font-size: 0.875rem; color: #64748b; }
        .performance-btn {
            position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white;
            padding: 15px 25px; border-radius: 50px; border: none; font-size: 1rem; font-weight: 600;
            cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3); transition: all 0.2s;
        }
        .performance-btn:hover { background: #2563eb; transform: translateY(-2px); }
        .performance-mode { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #1e293b; color: white; z-index: 1000; padding: 20px; }
        .performance-mode.active { display: flex; flex-direction: column; }
        .performance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .performance-close { background: #ef4444; color: white; border: none; padding: 10px 20px;
            border-radius: 8px; cursor: pointer; }
        .song-content { flex: 1; overflow-y: auto; padding: 20px; background: #334155; border-radius: 12px;
            white-space: pre-wrap; font-family: 'SF Mono', Consolas, monospace; font-size: var(--font-scale, 1em); }
        .navigation { display: flex; gap: 10px; margin-top: 20px; }
        .nav-btn { padding: 12px 20px; background: #475569; color: white; border: none;
            border-radius: 8px; cursor: pointer; flex: 1; }
        .nav-btn:hover { background: #64748b; }
        .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .font-controls { display: flex; gap: 10px; align-items: center; }
        .font-btn { background: #374151; color: white; border: none; padding: 8px 12px;
            border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
        .font-size-display { color: #9ca3af; font-size: 0.875rem; min-width: 40px; text-align: center; }
        .set-colors { display: flex; gap: 8px; margin-bottom: 15px; }
        .color-dot { width: 12px; height: 12px; border-radius: 50%; }
        @media (max-width: 768px) {
            .container { padding: 15px; }
            .header h1 { font-size: 2rem; }
            .set { padding: 15px; }
            .performance-mode { padding: 15px; }
            .song-content { padding: 15px; font-size: 0.9rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.setlistName}</h1>
            <p>Total Songs: ${data.allSongs.length} | Sets: ${data.sets.length}</p>
        </div>
        <div class="sets">
            ${data.sets.map((set, index) => {
                const setColor = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'][index % 8];
                return `
                <div class="set" style="border-left-color: ${setColor}">
                    <div class="set-header">
                        <h2 class="set-title" style="color: ${setColor}">${set.name}</h2>
                        <span class="set-count">${set.songs.length} songs</span>
                    </div>
                    <div class="songs">
                        ${set.songs.map((song: any) => `
                            <div class="song" onclick="openSong('${song.id}')" data-song-id="${song.id}">
                                <div class="song-name">${song.name}</div>
                                ${song.duration ? `<div class="song-duration">${song.duration}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        <button class="performance-btn" onclick="enterPerformanceMode()">
            🎵 Performance Mode
        </button>
    </div>

    <div class="performance-mode" id="performanceMode">
        <div class="performance-header">
            <div>
                <h2 id="currentSongTitle">Select a song</h2>
                <span id="songPosition"></span>
            </div>
            <div class="font-controls">
                <button class="font-btn" onclick="adjustFontSize(-0.1)">A-</button>
                <span class="font-size-display" id="fontSizeDisplay">100%</span>
                <button class="font-btn" onclick="adjustFontSize(0.1)">A+</button>
                <button class="performance-close" onclick="exitPerformanceMode()">Exit</button>
            </div>
        </div>
        <div class="song-content" id="songContent">
            Select a song to begin performance mode
        </div>
        <div class="navigation">
            <button class="nav-btn" id="prevBtn" onclick="previousSong()" disabled>⬅ Previous</button>
            <button class="nav-btn" id="nextBtn" onclick="nextSong()" disabled>Next ➡</button>
        </div>
    </div>

    <script type="application/json" id="setlist-data">${JSON.stringify(data)}</script>
    <script>
        ${embeddedMarkdownParser}
        
        let currentSongIndex = -1;
        let allSongs = [];
        let fontSize = 1;
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            const data = JSON.parse(document.getElementById('setlist-data').textContent);
            // Build ordered song list from sets
            data.sets.forEach(set => {
                set.songs.forEach(song => {
                    if (song) allSongs.push(song);
                });
            });
        });
        
        function getSetColor(index) {
            const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];
            return colors[index % colors.length];
        }
        
        function openSong(songId) {
            const index = allSongs.findIndex(s => s.id === songId);
            if (index !== -1) {
                currentSongIndex = index;
                enterPerformanceMode();
                showCurrentSong();
            }
        }
        
        function enterPerformanceMode() {
            document.getElementById('performanceMode').classList.add('active');
            if (currentSongIndex === -1 && allSongs.length > 0) {
                currentSongIndex = 0;
            }
            showCurrentSong();
            // Prevent screen sleep on mobile
            if ('wakeLock' in navigator) {
                navigator.wakeLock.request('screen').catch(() => {});
            }
        }
        
        function exitPerformanceMode() {
            document.getElementById('performanceMode').classList.remove('active');
        }
        
        function showCurrentSong() {
            if (currentSongIndex >= 0 && currentSongIndex < allSongs.length) {
                const song = allSongs[currentSongIndex];
                document.getElementById('currentSongTitle').textContent = song.name;
                document.getElementById('songPosition').textContent = \`Song \${currentSongIndex + 1} of \${allSongs.length}\`;
                
                // Parse markdown content
                const content = parseMarkdown(song.content);
                document.getElementById('songContent').innerHTML = content;
                
                // Update navigation buttons
                document.getElementById('prevBtn').disabled = currentSongIndex === 0;
                document.getElementById('nextBtn').disabled = currentSongIndex === allSongs.length - 1;
            }
        }
        
        function previousSong() {
            if (currentSongIndex > 0) {
                currentSongIndex--;
                showCurrentSong();
            }
        }
        
        function nextSong() {
            if (currentSongIndex < allSongs.length - 1) {
                currentSongIndex++;
                showCurrentSong();
            }
        }
        
        function adjustFontSize(delta) {
            fontSize = Math.max(0.5, Math.min(2, fontSize + delta));
            document.documentElement.style.setProperty('--font-scale', fontSize + 'em');
            document.getElementById('fontSizeDisplay').textContent = Math.round(fontSize * 100) + '%';
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (document.getElementById('performanceMode').classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        previousSong();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        nextSong();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        exitPerformanceMode();
                        break;
                }
            }
        });
        
        // Touch gestures for mobile (iOS 15 compatible)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            touchMoved = true;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!document.getElementById('performanceMode').classList.contains('active')) return;
            if (touchMoved) return; // Ignore if user was scrolling
            
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                e.preventDefault();
                if (diff > 0) {
                    nextSong(); // Swipe left = next
                } else {
                    previousSong(); // Swipe right = previous
                }
            }
        }, { passive: false });
    </script>
</body>
</html>`;
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
