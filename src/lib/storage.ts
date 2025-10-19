import type { StorageRepository } from '@/types';
import { isClient } from './utils';

/**
 * Storage repository implementation for browser storage
 */
class BrowserStorageRepository implements StorageRepository {
  private storage: Storage | null = null;

  constructor(storageType: 'local' | 'session' = 'local') {
    if (isClient()) {
      this.storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
    }
  }

  getItem(key: string): string | null {
    if (!this.storage) return null;
    
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.storage) return;
    
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }

  removeItem(key: string): void {
    if (!this.storage) return;
    
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }

  clear(): void {
    if (!this.storage) return;
    
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
}

/**
 * Create a storage repository instance
 */
export function createStorage(storageType: 'local' | 'session' = 'local'): StorageRepository {
  return new BrowserStorageRepository(storageType);
}

// Default storage instance
export const storage = createStorage('local');
