import { Config, DBValue, StorageController } from "types";

class DBController implements StorageController {
  private db: IDBDatabase | null = null;

  private storeName: string;

  private dbName: string;

  private version: number;

  private options: Config = {};

  constructor(dbName: string, storeName: string, version: number) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  config(options: Partial<Config>) {
    this.options = { ...this.options, ...options };
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
    const { downgrading } = this.options;

    return new Promise<IDBDatabase>((res, rej) => {
      if (this.db) res(this.db);

      const dbRequest = indexedDB.open(this.dbName, this.version);

      dbRequest.onerror = () => {
        if (downgrading && this.isLessVersionError(dbRequest.error)) {
          res(this.downgradeDB());
        }

        rej(dbRequest.error);
      };

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

  async downgradeDB() {
    await this.dropDB();

    return this.openDB();
  }

  dropDB() {
    const deleteRequest = indexedDB.deleteDatabase(this.dbName);

    return new Promise<void>((res, rej) => {
      deleteRequest.onsuccess = () => res();
      deleteRequest.onerror = () => rej(deleteRequest.error);
    });
  }

  private isLessVersionError(error: DOMException | null) {
    return error?.name === "VersionError";
  }
}

export default DBController;
