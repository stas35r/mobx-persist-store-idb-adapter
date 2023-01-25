var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DBController {
    constructor(dbName, storeName, version) {
        this.db = null;
        this.options = {};
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }
    config(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.openDB();
            const transaction = db
                .transaction(this.storeName, "readonly")
                .objectStore(this.storeName)
                .get(key);
            return new Promise((res, rej) => {
                transaction.onsuccess = () => {
                    res(transaction.result ? transaction.result : null);
                };
                transaction.onerror = () => rej(transaction.error);
            });
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.openDB();
            const transaction = db
                .transaction(this.storeName, "readwrite")
                .objectStore(this.storeName)
                .put(value, key);
            return new Promise((res, rej) => {
                transaction.onsuccess = () => res();
                transaction.onerror = () => rej(transaction.error);
            });
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.openDB();
            const transaction = db
                .transaction(this.storeName, "readwrite")
                .objectStore(this.storeName)
                .delete(key);
            return new Promise((res, rej) => {
                transaction.onsuccess = () => res();
                transaction.onerror = () => rej(transaction.error);
            });
        });
    }
    openDB() {
        const { downgrading } = this.options;
        return new Promise((res, rej) => {
            if (this.db)
                res(this.db);
            const dbRequest = indexedDB.open(this.dbName, this.version);
            dbRequest.onerror = () => {
                if (downgrading && this.isLessVersionError(dbRequest.error)) {
                    res(this.recreateDB());
                }
                rej(dbRequest.error);
            };
            dbRequest.onsuccess = () => {
                const hasObjectStore = dbRequest.result.objectStoreNames.contains(this.storeName);
                if (hasObjectStore) {
                    this.db = dbRequest.result;
                    res(dbRequest.result);
                }
                else {
                    dbRequest.result.close();
                    res(this.recreateDB());
                }
            };
            dbRequest.onupgradeneeded = () => {
                const storeNames = [...dbRequest.result.objectStoreNames];
                for (let i = 0; i < storeNames.length; i++) {
                    dbRequest.result.deleteObjectStore(storeNames[i]);
                }
                dbRequest.result.createObjectStore(this.storeName);
            };
        });
    }
    recreateDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dropDB();
            return this.openDB();
        });
    }
    dropDB() {
        const deleteRequest = indexedDB.deleteDatabase(this.dbName);
        return new Promise((res, rej) => {
            deleteRequest.onsuccess = () => res();
            deleteRequest.onerror = () => rej(deleteRequest.error);
        });
    }
    isLessVersionError(error) {
        return (error === null || error === void 0 ? void 0 : error.name) === "VersionError";
    }
}
export default DBController;
