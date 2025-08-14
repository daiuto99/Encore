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
  // Normalize sharp/flat symbols first
  const normalizedNote = note.replace('#', '♯').replace('b', '♭');
  
  // Handle both sharp and flat notation
  let index = NOTES_SHARP.indexOf(normalizedNote);
  if (index === -1) {
    index = NOTES_FLAT.indexOf(normalizedNote);
  }
  return index;
}

function transposeNote(note: string, semitones: number): string {
  const index = getNoteIndex(note);
  if (index === -1) return note; // Return original if not found
  
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12; // Handle negative modulo
  
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
  
  // Pattern 1: Obsidian-style chords in backticks with brackets: `[Chord]`
  transposedContent = transposedContent.replace(/`\[([CDEFGAB][♯♭#b]?(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?)\]`/g, (match, chord) => {
    const newChord = transposeChordName(chord, semitones);
    return `\`[${newChord}]\``;
  });
  
  // Pattern 2: Square bracket chords: [Chord]
  transposedContent = transposedContent.replace(/\[([CDEFGAB][♯♭#b]?(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?)\]/g, (match, chord) => {
    const newChord = transposeChordName(chord, semitones);
    return `[${newChord}]`;
  });
  
  // Transpose key signatures in the metadata (moved to end to avoid conflicts)
  // This pattern is processed AFTER other chord patterns to prevent interference
  
  // Pattern 3: Slash chords in backticks: `[C/G]`
  transposedContent = transposedContent.replace(/`\[([CDEFGAB][♯♭#b]?)\/([CDEFGAB][♯♭#b]?)\]`/g, (match, root, bass) => {
    const newRoot = transposeNote(root, semitones);
    const newBass = transposeNote(bass, semitones);
    return `\`[${newRoot}/${newBass}]\``;
  });
  
  // Pattern 4: Slash chords: [C/G]
  transposedContent = transposedContent.replace(/\[([CDEFGAB][♯♭#b]?)\/([CDEFGAB][♯♭#b]?)\]/g, (match, root, bass) => {
    const newRoot = transposeNote(root, semitones);
    const newBass = transposeNote(bass, semitones);
    return `[${newRoot}/${newBass}]`;
  });
  
  // Pattern 5: Regular chord names in text (without brackets)
  transposedContent = transposedContent.replace(/\b([CDEFGAB][♯♭#b]?)(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?\b/g, (match, chord) => {
    const newChord = transposeChordName(chord, semitones);
    return match.replace(chord, newChord);
  });
  
  // Final pattern: Transpose key signatures in metadata (after all chord patterns to avoid conflicts)
  transposedContent = transposedContent.replace(/\*\*Key:\*\*\s*([CDEFGAB][♯♭#b]?)\s*(Major|Minor|major|minor)/g, (match, key, mode) => {
    const newKey = transposeNote(key.replace('#', '♯').replace('b', '♭'), semitones);
    const outputKey = newKey.replace('♯', '#').replace('♭', 'b');
    return `**Key:** ${outputKey} ${mode}`;
  });
  
  return transposedContent;
}

function transposeChordName(chord: string, semitones: number): string {
  // Extract root note (handle both # and ♯, b and ♭)
  const rootMatch = chord.match(/^([CDEFGAB][♯♭#b]?)/);
  if (!rootMatch) return chord;
  
  const originalRoot = rootMatch[1];
  // Normalize sharp/flat symbols for processing
  const normalizedRoot = originalRoot.replace('#', '♯').replace('b', '♭');
  const newRoot = transposeNote(normalizedRoot, semitones);
  
  // Convert back to user's preferred format (# instead of ♯)
  const outputRoot = newRoot.replace('♯', '#').replace('♭', 'b');
  
  // Replace the root in the original chord
  return chord.replace(originalRoot, outputRoot);
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