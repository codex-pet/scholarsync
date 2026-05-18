const DB_NAME = "ScholarSyncDB";
const STORE_NAME = "ai_files";
const STUDY_STORE = "study_sets";
const CHAT_STORE = "chat_sessions";

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, 3);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STUDY_STORE)) {
        db.createObjectStore(STUDY_STORE, { keyPath: "fileId" });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        db.createObjectStore(CHAT_STORE, { keyPath: "fileId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFileLocally(fileData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(fileData);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadFilesLocally() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFileLocally(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Study Sets DB Operations ---

export async function saveStudySetLocally(studyData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STUDY_STORE, "readwrite");
    tx.objectStore(STUDY_STORE).put(studyData);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadStudySetsLocally() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STUDY_STORE, "readonly");
    const req = tx.objectStore(STUDY_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteStudySetLocally(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STUDY_STORE, "readwrite");
    tx.objectStore(STUDY_STORE).delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Chat Session DB Operations ---

export async function saveChatSession(sessionData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAT_STORE, "readwrite");
    tx.objectStore(CHAT_STORE).put(sessionData);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadChatSession(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAT_STORE, "readonly");
    const req = tx.objectStore(CHAT_STORE).get(fileId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteChatSession(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAT_STORE, "readwrite");
    tx.objectStore(CHAT_STORE).delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
