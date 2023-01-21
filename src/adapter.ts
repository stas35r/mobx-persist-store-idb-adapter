import { DBValue, StorageController } from "types";

class DBController implements StorageController {
  private db: IDBDatabase | null = null;

  private storeName: string;

  private dbName: string;

  private version: number;

  constructor(dbName: string, storeName: string, version: number) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  async getItem<T>(key: IDBValidKey): Promise<DBValue<T>> {
    const db = await this.openDB();

    const transaction = db
      .transaction(this.storeName, "readonly")
      .objectStore(this.storeName)
      .get(key);

    return new Promise<DBValue<T>>((res, rej) => {
      transaction.onsuccess = () => {
        res(transaction.result ? transaction.result : null);
      };

      transaction.onerror = () => rej(transaction.error);
    });
  }

  async setItem<T>(key: IDBValidKey, value: DBValue<T>) {
    const db = await this.openDB();

    const transaction = db
      .transaction(this.storeName, "readwrite")
      .objectStore(this.storeName)
      .put(value, key);

    return new Promise<void>((res, rej) => {
      transaction.onsuccess = () => res();
      transaction.onerror = () => rej(transaction.error);
    });
  }

  async removeItem(key: IDBValidKey) {
    const db = await this.openDB();

    const transaction = db
      .transaction(this.storeName, "readwrite")
      .objectStore(this.storeName)
      .delete(key);

    return new Promise<void>((res, rej) => {
      transaction.onsuccess = () => res();
      transaction.onerror = () => rej(transaction.error);
    });
  }

  private openDB() {
    return new Promise<IDBDatabase>((res, rej) => {
      if (this.db) res(this.db);

      const dbRequest = indexedDB.open(this.dbName, this.version);

      dbRequest.onerror = () => rej(dbRequest.error);

      dbRequest.onsuccess = () => {
        this.db = dbRequest.result;
        res(dbRequest.result);
      };

      dbRequest.onupgradeneeded = () => {
        const hasObjectStore = dbRequest.result.objectStoreNames.contains(
          this.storeName
        );

        if (hasObjectStore) {
          dbRequest.result.deleteObjectStore(this.storeName);
        }

        dbRequest.result.createObjectStore(this.storeName);
      };
    });
  }

  dropDB() {
    indexedDB.deleteDatabase(this.dbName);
  }
}

export default DBController;
