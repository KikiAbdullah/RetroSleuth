import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8.0.3/+esm';

const DB_NAME = 'RetroSleuthDB';
const DB_VERSION = 1;

class DatabaseManager {
  static db = null;

  static async getDB() {
    if (this.db) return this.db;
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves', { keyPath: 'caseId' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      }
    });
    return this.db;
  }

  // === SAVES ===
  static async saveCaseState(caseId, data) {
    const db = await this.getDB();
    await db.put('saves', { caseId, ...data, updatedAt: Date.now() });
  }

  static async loadCaseState(caseId) {
    const db = await this.getDB();
    const record = await db.get('saves', caseId);
    return record || null;
  }

  static async deleteCaseState(caseId) {
    const db = await this.getDB();
    await db.delete('saves', caseId);
  }

  static async getAllCaseStates() {
    const db = await this.getDB();
    return await db.getAll('saves');
  }

  // === SETTINGS ===
  static async saveSetting(key, value) {
    const db = await this.getDB();
    await db.put('settings', { key, value });
  }

  static async loadSetting(key) {
    const db = await this.getDB();
    const record = await db.get('settings', key);
    return record ? record.value : null;
  }

  static async deleteSetting(key) {
    const db = await this.getDB();
    await db.delete('settings', key);
  }
}

export { DatabaseManager };
