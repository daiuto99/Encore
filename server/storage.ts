import { type Song, type Set, type AppState } from "@shared/schema";

// Storage interface for setlist app - using in-memory storage for simplicity
export interface IStorage {
  // For future use if needed - currently everything is client-side
}

export class MemStorage implements IStorage {
  constructor() {
    // In-memory storage for setlist data if needed
  }
}

export const storage = new MemStorage();
