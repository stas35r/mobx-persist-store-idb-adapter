export type DBValue<T> = T | string | null;

export interface StorageController {
  getItem<T>(key: IDBValidKey): Promise<DBValue<T>>;
  setItem<T>(key: IDBValidKey, value: DBValue<T>): Promise<void>;
  removeItem(key: IDBValidKey): Promise<void>;
}
