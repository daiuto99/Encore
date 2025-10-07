import { z } from "zod";

export const songSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  duration: z.number().default(0),
  originalContent: z.string().optional(), // Track original content for comparison
  isModified: z.boolean().default(false), // Track if song has been edited
  lastModified: z.string().optional(), // ISO date string of last edit
  startsBy: z.enum(['L', 'C', 'none']).default('none'),
  soloBy: z.enum(['L', 'C', 'none']).default('none')
});

export const setSchema = z.object({
  id: z.number(),
  name: z.string(),
  songs: z.array(songSchema),
  color: z.string().default('blue')
});

export const appStateSchema = z.object({
  setlistName: z.string(),
  allSongs: z.array(songSchema),
  sets: z.array(setSchema),
  currentSetIndex: z.number().default(0),
  currentSongIndex: z.number().default(-1),
  fontSize: z.number().min(50).max(200).default(100),
  isDarkMode: z.boolean().default(false),
  isPerformanceMode: z.boolean().default(false),
  selectedPreviewSong: songSchema.nullable().optional(),
  exportDate: z.string().optional(),
  exportVersion: z.string().optional(),
  displaySettings: z.object({
    light: z.object({
      mainTextColor: z.string().default('#1e293b'),
      introColor: z.string().default('#3B82F6'),
      verseColor: z.string().default('#F97316'),
      chorusColor: z.string().default('#EF4444'),
      bridgeColor: z.string().default('#8B5CF6'),
      outroColor: z.string().default('#F59E0B'),
      soloColor: z.string().default('#10B981'),
      interludeColor: z.string().default('#06B6D4'),
      instrumentalColor: z.string().default('#EC4899'),
      showChords: z.boolean().default(true),
      showKey: z.boolean().default(true),
      boldChorus: z.boolean().default(false),
    }),
    dark: z.object({
      mainTextColor: z.string().default('#f8fafc'),
      introColor: z.string().default('#60A5FA'),
      verseColor: z.string().default('#FB923C'),
      chorusColor: z.string().default('#F87171'),
      bridgeColor: z.string().default('#A78BFA'),
      outroColor: z.string().default('#FBBF24'),
      soloColor: z.string().default('#34D399'),
      interludeColor: z.string().default('#22D3EE'),
      instrumentalColor: z.string().default('#F472B6'),
      showChords: z.boolean().default(true),
      showKey: z.boolean().default(true),
      boldChorus: z.boolean().default(false),
    })
  }).optional()
});

export type Song = z.infer<typeof songSchema>;
export type Set = z.infer<typeof setSchema>;
export type AppState = z.infer<typeof appStateSchema>;

export const insertSongSchema = songSchema.omit({ id: true });
export const insertSetSchema = setSchema.omit({ id: true });

export type InsertSong = z.infer<typeof insertSongSchema>;
export type InsertSet = z.infer<typeof insertSetSchema>;
