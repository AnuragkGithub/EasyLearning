import type { Resource } from "@/lib/demo-data";

const DB_NAME = "campusly-local-files";
const STORE_NAME = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Local file storage is not available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local file storage."));
  });
}

export async function saveLocalFile(id: string, file: File): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not save the file."));
    tx.onabort = () => reject(tx.error ?? new Error("File save was cancelled."));
  });
  db.close();
}

export async function getLocalFile(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not retrieve the file."));
  });
  db.close();
  return result;
}

export async function deleteLocalFile(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not delete the file."));
  });
  db.close();
}

const STORAGE_KEY = "campusly-local-state-v1";
export type LocalState = { saved: string[]; uploaded: Resource[] };

export function loadLocalState(): LocalState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter((v): v is string => typeof v === "string") : [],
      uploaded: Array.isArray(parsed.uploaded) ? parsed.uploaded as Resource[] : [],
    };
  } catch {
    return null;
  }
}

export function saveLocalState(state: LocalState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
