// Musical key transposition utilities

// Chromatic note names (sharps)
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Common chord patterns to match
const CHORD_PATTERNS = [
  // Slash chords (must come first to avoid double processing)
  /\b([CDEFGAB][♯♭]?)\/([CDEFGAB][♯♭]?)\b/g,
  // All chord types with root note
  /\b([CDEFGAB][♯♭]?)(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?\b/g
];

function getNoteIndex(note: string): number {
  // Handle both sharp and flat notation
  let index = NOTES_SHARP.indexOf(note);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(note);
  }
  return index;
}

function transposeNote(note: string, semitones: number): string {
  const index = getNoteIndex(note);
  if (index === -1) return note; // Return original if not found
  
  const newIndex = (index + semitones + 12) % 12;
  
  // Use sharps for positive transposition, flats for negative
  if (semitones >= 0) {
    return NOTES_SHARP[newIndex];
  } else {
    return NOTES_FLAT[newIndex];
  }
}

export function transposeChords(content: string, semitones: number): string {
  if (semitones === 0) return content;
  
  let transposedContent = content;
  
  // Process slash chords first
  transposedContent = transposedContent.replace(/\b([CDEFGAB][♯♭]?)\/([CDEFGAB][♯♭]?)\b/g, (match, root, bass) => {
    const newRoot = transposeNote(root, semitones);
    const newBass = transposeNote(bass, semitones);
    return `${newRoot}/${newBass}`;
  });
  
  // Then process regular chords
  transposedContent = transposedContent.replace(/\b([CDEFGAB][♯♭]?)(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?\b/g, (match, root) => {
    const newRoot = transposeNote(root, semitones);
    return match.replace(root, newRoot);
  });
  
  return transposedContent;
}

export function getKeyDisplayName(semitones: number): string {
  if (semitones === 0) return 'Original';
  if (semitones > 0) {
    return `+${semitones} (${Array(semitones).fill('♯').join('')})`;
  } else {
    return `${semitones} (${Array(Math.abs(semitones)).fill('♭').join('')})`;
  }
}

export function clampKeyTransposition(semitones: number): number {
  // Limit to reasonable range: -6 to +6 semitones
  return Math.max(-6, Math.min(6, semitones));
}