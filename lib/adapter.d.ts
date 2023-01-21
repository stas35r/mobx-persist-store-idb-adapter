import { DBValue, StorageController } from "types";
declare class DBController implements StorageController {
    private db;
    private storeName;
    private dbName;
    private version;
    constructor(dbName: string, storeName: string, version: number);
    getItem<T>(key: IDBValidKey): Promise<DBValue<T>>;
    setItem<T>(key: IDBValidKey, value: DBValue<T>): Promise<void>;
    removeItem(key: IDBValidKey): Promise<void>;
    private openDB;
    dropDB(): void;
}
export default DBController;
