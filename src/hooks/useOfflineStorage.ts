import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'rijplanner-offline';
const DB_VERSION = 1;

interface OfflineData {
  lessons: any[];
  users: any[];
  credits: any[];
  lastSync: string | null;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores for offline data
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('credits')) {
        db.createObjectStore('credits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Generic store operations
const storeData = async (storeName: string, data: any[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data and add new
    store.clear();
    data.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

const getData = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Pending actions for offline mutations
interface PendingAction {
  id?: number;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
}

const addPendingAction = async (action: Omit<PendingAction, 'id'>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingActions', 'readwrite');
    const store = transaction.objectStore('pendingActions');
    store.add(action);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

const getPendingActions = async (): Promise<PendingAction[]> => {
  return getData<PendingAction>('pendingActions');
};

const clearPendingActions = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingActions', 'readwrite');
    const store = transaction.objectStore('pendingActions');
    store.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save data for offline use
  const cacheData = useCallback(async (data: Partial<OfflineData>) => {
    try {
      if (data.lessons) await storeData('lessons', data.lessons);
      if (data.users) await storeData('users', data.users);
      if (data.credits) await storeData('credits', data.credits);
      
      // Update last sync time
      const db = await initDB();
      const transaction = db.transaction('meta', 'readwrite');
      const store = transaction.objectStore('meta');
      store.put({ key: 'lastSync', value: new Date().toISOString() });
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(async (): Promise<OfflineData> => {
    try {
      const [lessons, users, credits] = await Promise.all([
        getData<any>('lessons'),
        getData<any>('users'),
        getData<any>('credits'),
      ]);

      const db = await initDB();
      const transaction = db.transaction('meta', 'readonly');
      const store = transaction.objectStore('meta');
      const lastSyncRequest = store.get('lastSync');

      return new Promise((resolve) => {
        lastSyncRequest.onsuccess = () => {
          resolve({
            lessons,
            users,
            credits,
            lastSync: lastSyncRequest.result?.value || null,
          });
        };
        lastSyncRequest.onerror = () => {
          resolve({ lessons, users, credits, lastSync: null });
        };
      });
    } catch (error) {
      console.error('Error getting cached data:', error);
      return { lessons: [], users: [], credits: [], lastSync: null };
    }
  }, []);

  // Queue an action for when back online
  const queueAction = useCallback(async (type: PendingAction['type'], table: string, data: any) => {
    await addPendingAction({
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Sync pending actions when back online
  const syncPendingActions = useCallback(async (syncFn: (actions: PendingAction[]) => Promise<void>) => {
    const actions = await getPendingActions();
    if (actions.length > 0) {
      try {
        await syncFn(actions);
        await clearPendingActions();
      } catch (error) {
        console.error('Error syncing pending actions:', error);
        throw error;
      }
    }
  }, []);

  return {
    isOnline,
    cacheData,
    getCachedData,
    queueAction,
    syncPendingActions,
  };
};
