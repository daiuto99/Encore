// Musical key transposition utilities

// Chromatic note names (sharps)
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Common chord patterns to match (case insensitive)
const CHORD_PATTERNS = [
  // Major chords
  /\b([CDEFGAB][♯♭]?)(maj|major|M)?\b/g,
  // Minor chords
  /\b([CDEFGAB][♯♭]?)(m|min|minor)\b/g,
  // Seventh chords
  /\b([CDEFGAB][♯♭]?)(7|maj7|min7|m7|dim7|aug7|sus7)\b/g,
  // Extended chords
  /\b([CDEFGAB][♯♭]?)(9|11|13|add9|sus2|sus4|dim|aug)\b/g,
  // Slash chords
  /\b([CDEFGAB][♯♭]?)\/([CDEFGAB][♯♭]?)\b/g,
  // Simple note names (for lead sheets)
  /\b([CDEFGAB][♯♭]?)\b/g
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
  
  // Apply transposition to all chord patterns
  CHORD_PATTERNS.forEach(pattern => {
    transposedContent = transposedContent.replace(pattern, (match, ...groups) => {
      // Handle different chord pattern structures
      if (groups.length >= 2 && groups[1] && groups[1].match(/^[CDEFGAB][♯♭]?$/)) {
        // Slash chord: transpose both notes
        const rootNote = transposeNote(groups[0], semitones);
        const bassNote = transposeNote(groups[1], semitones);
        return match.replace(groups[0], rootNote).replace(groups[1], bassNote);
      } else {
        // Regular chord: transpose root note only
        const rootNote = transposeNote(groups[0], semitones);
        return match.replace(groups[0], rootNote);
      }
    });
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