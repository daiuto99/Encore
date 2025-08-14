// Test the exact issue: D going to F instead of D#
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

function getNoteIndex(note) {
  const normalizedNote = note.replace('#', '♯').replace('b', '♭');
  let index = NOTES_SHARP.indexOf(normalizedNote);
  console.log(`Finding index for "${note}" -> normalized: "${normalizedNote}" -> index: ${index}`);
  return index;
}

function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  const result = NOTES_SHARP[newIndex];
  console.log(`${note} (index ${index}) + ${semitones} = ${result} (index ${newIndex})`);
  return result;
}

function transposeChordName(chord, semitones) {
  const rootMatch = chord.match(/^([CDEFGAB][♯♭#b]?)/);
  if (!rootMatch) return chord;
  
  const originalRoot = rootMatch[1];
  const normalizedRoot = originalRoot.replace('#', '♯').replace('b', '♭');
  const newRoot = transposeNote(normalizedRoot, semitones);
  const outputRoot = newRoot.replace('♯', '#').replace('♭', 'b');
  
  console.log(`Chord: ${chord} -> Root: ${originalRoot} -> Normalized: ${normalizedRoot} -> New: ${newRoot} -> Output: ${outputRoot}`);
  
  return chord.replace(originalRoot, outputRoot);
}

// Test the exact problem
console.log('=== Testing D specifically ===');
transposeChordName('D', 1);

console.log('\n=== Full chord test ===');
const testContent = '`[D]` `[C]` `[G]` `[A]`';
console.log('Input:', testContent);

let result = testContent.replace(/`\[([CDEFGAB][♯♭#b]?(?:maj|major|M|m|min|minor|7|maj7|min7|m7|dim7|aug7|sus7|9|11|13|add9|sus2|sus4|dim|aug)?)\]`/g, (match, chord) => {
  const newChord = transposeChordName(chord, 1);
  return `\`[${newChord}]\``;
});

console.log('Result:', result);
console.log('Expected: `[D#]` `[C#]` `[G#]` `[A#]`');