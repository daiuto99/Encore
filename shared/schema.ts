import { z } from "zod";

export const songSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  duration: z.number().default(0),
  originalContent: z.string().optional(), // Track original content for comparison
  isModified: z.boolean().default(false), // Track if song has been edited
  lastModified: z.string().optional() // ISO date string of last edit
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
  exportDate: z.string().optional()
});

export type Song = z.infer<typeof songSchema>;
export type Set = z.infer<typeof setSchema>;
export type AppState = z.infer<typeof appStateSchema>;

export const insertSongSchema = songSchema.omit({ id: true });
export const insertSetSchema = setSchema.omit({ id: true });

export type InsertSong = z.infer<typeof insertSongSchema>;
export type InsertSet = z.infer<typeof insertSetSchema>;
