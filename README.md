# IndexedDB adapter for mobx-persist-store
> Adapter for storing data using mobx-persist-store 
[![Downloads Stats][npm-downloads]][npm-url]

Provides an IndexedDB adapter for the mobx-persist-store library.

## Installation

Yarn:

```sh
yarn add mobx-persist-store-idb-adapter
```

NPM:

```sh
npm install mobx-persist-store-idb-adapter
```

## Usage example

```ts
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import DBController from "mobx-persist-store-idb-adapter";

class StoreExample {
    counter = 0;

    constructor() {
        const indexedDBStore = new DBController("dbName", "objectStoreName", 1);

        makeAutoObservable(this, {}, { autoBind: true });

        makePersistable(this, {
            name: "StoreExample",
            properties: ["counter"],
            storage: indexedDBStore,
            stringify: false,
        });
    }

    increase() {
        this.counter += 1;
    }

    decrease() {
        this.counter -= 1;
    }
}

export const storeExample = new StoreExample();


```

## Meta

stas35r – stas35r@gmail.com

Distributed under the MIT license. See [LICENSE][LICENSE] for more information.

[https://github.com/stas35r/mobx-persist-store-idb-adapter](https://github.com/stas35r/mobx-persist-store-idb-adapter)

<!-- Markdown link & img dfn's -->
[npm-url]: https://npmjs.org/package/mobx-persist-store-idb-adapter
[npm-downloads]: https://img.shields.io/npm/dm/mobx-persist-store-idb-adapter.svg?style=flat-square
[LICENSE]: https://github.com/stas35r/mobx-persist-store-idb-adapter/blob/main/LICENSE.md