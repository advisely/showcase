import { openDB } from 'idb';

const DB_NAME = 'ShowcaseDB';
const DB_VERSION = 1;
const STORE_NAME = 'presentations';

// Initialize IndexedDB
export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
    return db;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw new Error('Storage not available. Please check browser settings.');
  }
};

// Save presentation data
export const savePresentation = async (id = 'current', data) => {
  try {
    const db = await initDB();

    const presentation = {
      id,
      timestamp: Date.now(),
      data
    };

    await db.put(STORE_NAME, presentation);
    return true;
  } catch (error) {
    console.error('Failed to save presentation:', error);

    // Try to save to file as backup
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Please export your presentation.');
      throw new Error('Storage full. Please export your presentation to save it.');
    }

    throw error;
  }
};

// Load presentation data
export const loadPresentation = async (id = 'current') => {
  try {
    const db = await initDB();
    const presentation = await db.get(STORE_NAME, id);

    if (presentation) {
      return presentation.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to load presentation:', error);
    return null;
  }
};

// Get all presentations
export const getAllPresentations = async () => {
  try {
    const db = await initDB();
    const presentations = await db.getAll(STORE_NAME);
    return presentations.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get presentations:', error);
    return [];
  }
};

// Delete presentation
export const deletePresentation = async (id) => {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
    console.log('✅ Presentation deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete presentation:', error);
    return false;
  }
};

// Clear all presentations
export const clearAllPresentations = async () => {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
    console.log('✅ All presentations cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear presentations:', error);
    return false;
  }
};

// Get storage usage estimate
export const getStorageInfo = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota * 100).toFixed(2) : 0;

      return {
        usage,
        quota,
        percentUsed,
        available: quota - usage,
        usageFormatted: formatBytes(usage),
        quotaFormatted: formatBytes(quota),
        availableFormatted: formatBytes(quota - usage)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  }

  return null;
};

// Format bytes to human readable
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Migrate from old localStorage (cleanup)
export const migrateFromLocalStorage = async () => {
  try {
    // Check for old data
    const oldData = localStorage.getItem('showcase_presentation');

    if (oldData) {
      console.log('📦 Migrating data from localStorage to IndexedDB...');
      const data = JSON.parse(oldData);
      await savePresentation('current', data);

      // Remove old data
      localStorage.removeItem('showcase_presentation');
      localStorage.removeItem('flexPresent_presentation');

      console.log('✅ Migration complete!');
      return true;
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }

  return false;
};
