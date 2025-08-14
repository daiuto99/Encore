// Debug the exact current issue
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

function getNoteIndex(note) {
  const normalizedNote = note.replace('#', '♯').replace('b', '♭');
  return NOTES_SHARP.indexOf(normalizedNote);
}

function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  return NOTES_SHARP[newIndex];
}

function getKeyDisplayName(semitones) {
  if (semitones === 0) return 'Original';
  if (semitones > 0) {
    return `+${semitones} (${Array(semitones).fill('♯').join('')})`;
  } else {
    return `${semitones} (${Array(Math.abs(semitones)).fill('♭').join('')})`;
  }
}

function transposeChordName(chord, semitones) {
  const rootMatch = chord.match(/^([CDEFGAB][♯♭#b]?)/);
  if (!rootMatch) return chord;
  
  const originalRoot = rootMatch[1];
  const normalizedRoot = originalRoot.replace('#', '♯').replace('b', '♭');
  const newRoot = transposeNote(normalizedRoot, semitones);
  const outputRoot = newRoot.replace('♯', '#').replace('♭', 'b');
  
  return chord.replace(originalRoot, outputRoot);
}

// Test the exact scenario from the screenshot
console.log('=== Testing Original Intro ===');
console.log('Original chords: D, C, G, A');

console.log('\n=== Testing +1 transposition ===');
console.log('D + 1 =', transposeChordName('D', 1));
console.log('C + 1 =', transposeChordName('C', 1)); 
console.log('G + 1 =', transposeChordName('G', 1));
console.log('A + 1 =', transposeChordName('A', 1));

console.log('\n=== Expected: D#, C#, G#, A# ===');

console.log('\n=== Testing Key Display ===');
console.log('Original key: D Major');
console.log('Transposed key: D + 1 =', transposeNote('D', 1), 'Major');
console.log('Key display for +1:', getKeyDisplayName(1));

console.log('\n=== But screenshot shows: F, D#, A#, C ===');
console.log('This suggests multiple transpositions or wrong source content');

// Test what would give us F, D#, A#, C
console.log('\n=== Reverse engineering what gives F, D#, A#, C ===');
console.log('If we got F from D, that means D + ? = F');
console.log('D index:', getNoteIndex('D'), 'F index:', getNoteIndex('F'));
console.log('Difference:', getNoteIndex('F') - getNoteIndex('D')); // Should be 3 semitones