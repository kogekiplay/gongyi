import { invoke } from '@tauri-apps/api/core';
import { HistoryItem } from '../calc/types';

const STORAGE_KEY = 'gongyi_history_v2';
const MAX_ITEMS = 50;

let memoryCache: HistoryItem[] = [];
let isInitialized = false;
let initPromise: Promise<HistoryItem[]> | null = null;

// Check if Tauri environment
const isTauri = !!(window as any).__TAURI__;

export const historyStorage = {
  init: async (): Promise<HistoryItem[]> => {
    if (isInitialized) return memoryCache;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      if (isTauri) {
        try {
          const data = await invoke<string>('load_history');
          memoryCache = JSON.parse(data);
        } catch (e) {
          console.error('Failed to load history from Tauri:', e);
          memoryCache = [];
        }
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          memoryCache = raw ? JSON.parse(raw) : [];
        } catch {
          memoryCache = [];
        }
      }
      isInitialized = true;
      return memoryCache;
    })();

    return initPromise;
  },

  getAll: () => memoryCache,

  add: async (item: HistoryItem) => {
    // Ensure initialized before adding to avoid overwriting with empty cache if not loaded
    if (!isInitialized) await historyStorage.init();
    
    const updated = [item, ...memoryCache].slice(0, MAX_ITEMS);
    memoryCache = updated;
    await historyStorage.persist();
    return updated;
  },

  delete: async (ids: string[]) => {
    const updated = memoryCache.filter(i => !ids.includes(i.id));
    memoryCache = updated;
    await historyStorage.persist();
    return updated;
  },

  clear: async () => {
    memoryCache = [];
    await historyStorage.persist();
  },

  persist: async () => {
    const data = JSON.stringify(memoryCache);
    if (isTauri) {
      try {
        await invoke('save_history', { data });
      } catch (e) {
        console.error('Failed to save history to Tauri:', e);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, data);
    }
  }
};
