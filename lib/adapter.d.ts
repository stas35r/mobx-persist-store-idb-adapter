import { Config, DBValue, StorageController } from "./types";
declare class DBController implements StorageController {
    private db;
    private storeName;
    private dbName;
    private version;
    private options;
    constructor(dbName: string, storeName: string, version: number);
    config(options: Partial<Config>): void;
    getItem<T>(key: IDBValidKey): Promise<DBValue<T>>;
    setItem<T>(key: IDBValidKey, value: DBValue<T>): Promise<void>;
    removeItem(key: IDBValidKey): Promise<void>;
    private openDB;
    recreateDB(): Promise<IDBDatabase>;
    dropDB(): Promise<void>;
    private isLessVersionError;
}
export default DBController;
