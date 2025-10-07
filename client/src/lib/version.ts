export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

export function getVersionString(): string {
  return `v${VERSION}`;
}

export function getFullVersionString(): string {
  const buildDate = new Date(BUILD_DATE).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  return `Version ${VERSION} - Built ${buildDate}`;
}
