// Debug the exact transposition issue
const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

function getNoteIndex(note) {
  const normalizedNote = note.replace('#', '♯').replace('b', '♭');
  let index = NOTES_SHARP.indexOf(normalizedNote);
  console.log(`Note: ${note} -> Normalized: ${normalizedNote} -> Index: ${index}`);
  return index;
}

function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  const result = NOTES_SHARP[newIndex];
  console.log(`${note} (index ${index}) + ${semitones} semitones = ${result} (index ${newIndex})`);
  return result;
}

// Test each note individually
console.log('=== Testing D -> D# ===');
transposeNote('D', 1);

console.log('\n=== Testing C -> C# ===');
transposeNote('C', 1);

console.log('\n=== Testing G -> G# ===');
transposeNote('G', 1);

console.log('\n=== Testing A -> A# ===');
transposeNote('A', 1);

console.log('\n=== Note array for reference ===');
NOTES_SHARP.forEach((note, i) => console.log(`${i}: ${note}`));