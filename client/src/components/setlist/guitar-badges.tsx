import { Song } from '@shared/schema';

interface GuitarBadgesProps {
  song: Song;
  size?: 'sm' | 'md';
}

export function GuitarBadges({ song, size = 'md' }: GuitarBadgesProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const px = size === 'sm' ? 'px-2' : 'px-3';
  
  return (
    <div className="flex gap-1 items-center">
      {song.startsBy && song.startsBy !== 'none' && (
        <span className={`${textSize} ${px} py-0.5 rounded-full font-semibold ${song.startsBy === 'L' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {song.startsBy === 'L' ? '🟠 L' : '🟢 C'}
        </span>
      )}
      {song.soloBy && song.soloBy !== 'none' && (
        <span className={`${textSize} ${px} py-0.5 rounded-full font-semibold ${song.soloBy === 'L' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          Solo: {song.soloBy === 'L' ? '🟠 L' : '🟢 C'}
        </span>
      )}
    </div>
  );
}
