// indexedDB.js

export function openPrivacyLossDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PrivacyLossDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("pendingEvents")) {
        db.createObjectStore("pendingEvents", {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("reportCalls")) {
        db.createObjectStore("reportCalls", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
  });
}

export async function savePendingEvent(event) {
  const db = await openPrivacyLossDB();
  const tx = db.transaction("pendingEvents", "readwrite");
  tx.objectStore("pendingEvents").add(event);
  return tx.complete;
}

export async function saveReportCall(report) {
  const db = await openPrivacyLossDB();
  const tx = db.transaction("reportCalls", "readwrite");
  tx.objectStore("reportCalls").add(report);
  return tx.complete;
}

export async function getAllPendingEvents() {
  const db = await openPrivacyLossDB();
  const tx = db.transaction("pendingEvents", "readonly");
  const store = tx.objectStore("pendingEvents");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function getAllReportCalls() {
  const db = await openPrivacyLossDB();
  const tx = db.transaction("reportCalls", "readonly");
  const store = tx.objectStore("reportCalls");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function formatDate(isoString) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const date = new Date(isoString);
  return date.toLocaleString(undefined, options);
}
