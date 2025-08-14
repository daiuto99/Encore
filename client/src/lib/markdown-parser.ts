// Simple markdown parser for basic formatting
export function parseMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');
}

// For production use, we'd embed a proper markdown library like marked.js
export const embeddedMarkdownParser = `
// Marked.js v4.3.0 - Embedded for offline use
(function(){
  // This would contain the full marked.js library minified
  // For now, using simple parser above
  window.parseMarkdown = function(content) {
    return content
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\\n/g, '<br>');
  };
})();
`;
