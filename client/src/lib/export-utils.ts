import { AppState } from '@shared/schema';
import { embeddedMarkdownParser } from './markdown-parser';

// Embed the key transposition utilities
const embeddedKeyTransposition = `
// Musical key transposition utilities
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Updated chord patterns for export

function getNoteIndex(note) {
  // Normalize sharp/flat symbols first
  const normalizedNote = note.replace(/#/g, '♯').replace(/b/g, '♭');
  
  let index = NOTES_SHARP.indexOf(normalizedNote);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(normalizedNote);
  }
  return index;
}

function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  
  const newIndex = (index + semitones + 12) % 12;
  
  if (semitones >= 0) {
    return NOTES_SHARP[newIndex];
  } else {
    return NOTES_FLAT[newIndex];
  }
}

function transposeChords(content, semitones) {
  if (semitones === 0) return content;
  
  let transposedContent = content;
  
  // Pattern 1: Obsidian-style chords in backticks with brackets: \`[Chord]\`
  transposedContent = transposedContent.replace(/\`\\[([CDEFGAB][♯♭#b]?(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?)\\]\`/g, function(match, chord) {
    const newChord = transposeChordName(chord, semitones);
    return '\`[' + newChord + ']\`';
  });
  
  // Pattern 2: Square bracket chords: [Chord]
  transposedContent = transposedContent.replace(/\\[([CDEFGAB][♯♭#b]?(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?)\\]/g, function(match, chord) {
    const newChord = transposeChordName(chord, semitones);
    return '[' + newChord + ']';
  });
  
  // Pattern 3: Slash chords in backticks: \`[C/G]\`
  transposedContent = transposedContent.replace(/\`\\[([CDEFGAB][♯♭#b]?)\\/([CDEFGAB][♯♭#b]?)\\]\`/g, function(match, root, bass) {
    const newRoot = transposeNote(root, semitones);
    const newBass = transposeNote(bass, semitones);
    return '\`[' + newRoot + '/' + newBass + ']\`';
  });
  
  // Pattern 4: Slash chords: [C/G]
  transposedContent = transposedContent.replace(/\\[([CDEFGAB][♯♭#b]?)\\/([CDEFGAB][♯♭#b]?)\\]/g, function(match, root, bass) {
    const newRoot = transposeNote(root, semitones);
    const newBass = transposeNote(bass, semitones);
    return '[' + newRoot + '/' + newBass + ']';
  });
  
  // Pattern 5: Regular chord names in text (without brackets)
  transposedContent = transposedContent.replace(/\\b([CDEFGAB][♯♭#b]?)(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?\\b/g, function(match, chord) {
    const newChord = transposeChordName(chord, semitones);
    return match.replace(chord, newChord);
  });
  
  return transposedContent;
}

function transposeChordName(chord, semitones) {
  // Extract root note (handle both # and ♯, b and ♭)
  const rootMatch = chord.match(/^([CDEFGAB][♯♭#b]?)/);
  if (!rootMatch) return chord;
  
  const originalRoot = rootMatch[1];
  // Normalize sharp/flat symbols for processing
  const normalizedRoot = originalRoot.replace(/#/g, '♯').replace(/b/g, '♭');
  const newRoot = transposeNote(normalizedRoot, semitones);
  
  // Convert back to user's preferred format (# instead of ♯)
  const outputRoot = newRoot.replace(/♯/g, '#').replace(/♭/g, 'b');
  
  // Replace the root in the original chord
  return chord.replace(originalRoot, outputRoot);
}

function getKeyDisplayName(semitones) {
  if (semitones === 0) return 'Original';
  if (semitones > 0) {
    return \`+\${semitones} (\${Array(semitones).fill('♯').join('')})\`;
  } else {
    return \`\${semitones} (\${Array(Math.abs(semitones)).fill('♭').join('')})\`;
  }
}
`;

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
  
  // Embed the key transposition utilities
  const keyTranspositionScript = `<script>${embeddedKeyTransposition}</script>`;
  
  // Insert scripts before closing body tag
  const htmlWithData = currentHTML
    .replace('</body>', `${dataScript}${parserScript}${keyTranspositionScript}</body>`)
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
