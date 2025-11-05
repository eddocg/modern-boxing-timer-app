/**
 * Storage utilities with error handling and recovery
 */

// Try to import AsyncStorage from react-native-community or fallback to in-memory
let AsyncStorage: any;
try {
  // @ts-ignore - Optional dependency
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Fallback: in-memory storage for environments without AsyncStorage
  const memoryStorage = new Map<string, string>();
  AsyncStorage = {
    getItem: (key: string) => Promise.resolve(memoryStorage.get(key) || null),
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
      return Promise.resolve();
    },
    clear: () => {
      memoryStorage.clear();
      return Promise.resolve();
    },
  };
}

/**
 * Safely initialize and clear corrupted storage
 * This handles Expo SQLite corruption issues
 */
export async function initializeStorage(): Promise<void> {
  try {
    // Test if storage is working by attempting a read
    await AsyncStorage.getItem('__storage_test__');
    // If we get here, storage is healthy
    return;
  } catch (error: any) {
    // Check if this is a database corruption error
    if (error?.message?.includes('checksum') || error?.message?.includes('corrupt')) {
      console.warn('Storage corruption detected, attempting recovery...');
      try {
        // Try to clear all data to reset corrupted state
        await AsyncStorage.clear();
        console.log('Storage cleared and reset');
        return;
      } catch (clearError) {
        console.error('Failed to clear corrupted storage:', clearError);
        throw clearError;
      }
    }
    // Re-throw if it's not a corruption error
    throw error;
  }
}

/**
 * Get a value from storage with error handling
 */
export async function getFromStorage<T>(key: string, defaultValue?: T): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue ?? null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to read from storage (${key}):`, error);
    return defaultValue ?? null;
  }
}

/**
 * Save a value to storage with error handling
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to storage (${key}):`, error);
  }
}

/**
 * Remove a value from storage
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from storage (${key}):`, error);
  }
}
