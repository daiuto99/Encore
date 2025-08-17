// Enhanced markdown parser with better iOS Safari support
export function parseMarkdown(content: string): string {
  if (!content) return '';
  
  // Normalize line endings for cross-platform compatibility
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
    
  return normalized
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
    .replace(/\{harmony\}([\s\S]*?)\{\/harmony\}/g, '<span class="harmony-line">$1</span>')
    
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
