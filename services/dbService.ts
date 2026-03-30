
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'factium_quick_access';
const STORE_NAME = 'sync_data';

export interface SyncData {
  id: string;
  type: 'screenshot' | 'audio' | 'text' | 'research' | 'fact_check' | 'policy' | 'finance';
  data: any; // base64, text, or structured object
  timestamp: number;
  imported: boolean;
  view?: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveSyncData = async (data: SyncData) => {
  const db = await getDB();
  await db.put(STORE_NAME, data);
};

export const getAllSyncData = async (): Promise<SyncData[]> => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

export const deleteSyncData = async (id: string) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

export const markAsImported = async (id: string) => {
  const db = await getDB();
  const item = await db.get(STORE_NAME, id);
  if (item) {
    item.imported = true;
    await db.put(STORE_NAME, item);
  }
};
