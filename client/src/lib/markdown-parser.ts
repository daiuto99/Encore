import { type DisplaySettings } from './display-settings';

// Enhanced markdown parser with better iOS Safari support
export function parseMarkdown(content: string, settings?: DisplaySettings): string {
  if (!content) return '';
  
  const s = settings || {
    mainTextColor: '#1e293b',
    introColor: '#3B82F6',
    verseColor: '#F97316',
    chorusColor: '#EF4444',
    bridgeColor: '#8B5CF6',
    outroColor: '#F59E0B',
    soloColor: '#10B981',
    interludeColor: '#06B6D4',
    instrumentalColor: '#EC4899',
    showChords: true,
    showKey: true,
    boldChorus: false,
  };
  
  // Normalize line endings for cross-platform compatibility
  let normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Hide key if setting is off
  if (!s.showKey) {
    normalized = normalized.replace(/^\*\*Key:\*\* .+$/gm, '');
  }
  
  // Override section colors with settings
  normalized = normalized
    .replace(/<span style="[^"]*">(##\s*Intro[^<]*)<\/span>/gi, `<span style="color: ${s.introColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Verse[^<]*)<\/span>/gi, `<span style="color: ${s.verseColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Chorus[^<]*)<\/span>/gi, `<span style="color: ${s.chorusColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Bridge[^<]*)<\/span>/gi, `<span style="color: ${s.bridgeColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Outro[^<]*)<\/span>/gi, `<span style="color: ${s.outroColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Solo[^<]*)<\/span>/gi, `<span style="color: ${s.soloColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Interlude[^<]*)<\/span>/gi, `<span style="color: ${s.interludeColor}; font-weight: bold;">$1</span>`)
    .replace(/<span style="[^"]*">(##\s*Instrumental[^<]*)<\/span>/gi, `<span style="color: ${s.instrumentalColor}; font-weight: bold;">$1</span>`);
  
  // Hide chords if disabled
  if (!s.showChords) {
    normalized = normalized.replace(/`\[[^\]]+\]`/g, '');
  }
  
  // Bold chorus if enabled
  if (s.boldChorus) {
    normalized = normalized.replace(/(##\s*Chorus[\s\S]*?)(?=##|$)/gi, '<strong>$1</strong>');
  }
    
  let html = normalized
    // Process headings first (with proper line boundary handling)
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
    
    // Process bold and italic (non-greedy matching)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
    
    // Process inline code
    .replace(/`([^`\n]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Process vocal harmony markers (handle multiline) - but only if harmony tags exist
    .replace(/\{harmony-high\}([\s\S]*?)\{\/harmony-high\}/g, '<span class="harmony-high">$1</span>')
    .replace(/\{harmony-low\}([\s\S]*?)\{\/harmony-low\}/g, '<span class="harmony-low">$1</span>')
    .replace(/\{harmony\}([\s\S]*?)\{\/harmony\}/g, '<span class="harmony-highlight">$1</span>')
    
    // Process links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
    
    // Process line breaks - handle double line breaks as paragraphs
    .replace(/\n\n+/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraph if content doesn't start with a heading
    .replace(/^(?!<[h1-6])/gm, '<p class="mb-4">')
    
    // Clean up empty paragraphs and fix structure
    .replace(/<p class="mb-4"><\/p>/g, '')
    .replace(/<p class="mb-4">(<h[1-6])/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  
  // Apply main text color to all paragraph text
  html = html.replace(/<p class="mb-4">/g, `<p class="mb-4" style="color: ${s.mainTextColor};">`);
  
  return html;
}

// Enhanced embedded markdown parser for offline exports
export const embeddedMarkdownParser = `
// Enhanced markdown parser with iOS Safari support - Embedded for offline use
(function(){
  window.parseMarkdown = function(content) {
    if (!content) return '';
    
    // Normalize line endings for cross-platform compatibility
    const normalized = content
      .replace(/\\r\\n/g, '\\n')
      .replace(/\\r/g, '\\n');
      
    return normalized
      // Process headings first (with proper line boundary handling)
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
      
      // Process bold and italic (non-greedy matching)
      .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)/g, '<em class="italic">$1</em>')
      
      // Process inline code
      .replace(/\`([^\`\\n]+)\`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Process vocal harmony markers (handle multiline)
      .replace(/\\{harmony\\}([\\s\\S]*?)\\{\\/harmony\\}/g, '<span class="harmony-line">$1</span>')
      
      // Process links
      .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      
      // Process line breaks - handle double line breaks as paragraphs
      .replace(/\\n\\n+/g, '</p><p class="mb-4">')
      .replace(/\\n/g, '<br>')
      
      // Wrap in paragraph if content doesn't start with a heading
      .replace(/^(?!<[h1-6])/gm, '<p class="mb-4">')
      
      // Clean up empty paragraphs and fix structure
      .replace(/<p class="mb-4"><\\/p>/g, '')
      .replace(/<p class="mb-4">(<h[1-6])/g, '$1')
      .replace(/(<\\/h[1-6]>)<\\/p>/g, '$1');
  };
})();
`;
