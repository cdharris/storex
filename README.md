Storex is a minimal storage layer as a foundation for easing common problems around storing and moving data around. Allowing you to describe your data layout as a graph and providing different plugins, it helps you interact with (No)SQL databases, data migration, offline first applications architecture, creating and consuming REST/GraphQL APIs, permission management, finding optimization opportunaties and more. The aim is to provide a minimalistic common ground/language for working with your data, providing packages for solving the most common problems around data, while giving you easy access to the underlying machinery to do the things that are specific to your application.

**Status:** Proof of concept used in production to interact with IndexedDB while having the freedom to shift to the cloud and decentralize storage in the near future. Needs a lot more development, but implemented functionality is stable. Please consider contributing through easy to pick up tasks to get you started!

Installation
============

Storex is a collection of Node.js modules (written in TypeScript) available through NPM, meant to be used both client- and server-side. To start, you need the core and a backend:
```
$ npm install storex --save
$ npm install storex-backend-dexie # Only one available right now using IndexedDB, Sequelize back-end waiting to be released
```

Basic usage
===========

First, configure a StorageBackend and set up the StorageManager, which will be the main point of access to define, query and manipulate your data. For more in-depth information on how to do all of this, please refer to [the docs](./docs/0-start-here.md).

```
import StorageManager from 'storex'
import { DexieStorageBackend } from 'storex-backend-dexie'

const storageBackend = new DexieStorageBackend({dbName: 'my-awesome-product'})
const storageManager = new StorageManager({ backend })
storageManager.registry.registerCollections({
    user: {
        version: new Date(2018, 11, 11),
        fields: {
            identifier: { type: 'string' },
            isActive: { type: 'boolean' },
        },
        indices: [
            { field: 'identifier' },
        ]
    },
    todoList: {
        version: new Date(2018, 7, 11),
        fields: {
            title: { type: 'string' },
        },
        relationships: [
            {childOf: 'user'} # creates one-to-many relationship
        ],
        indices: []
    },
    todoListEntry: {
        version: new Date(2018, 7, 11),
        fields: {
            content: {type: 'text'},
            done: {type: 'boolean'}
        },
        relationships: [
            {childOf: 'todoList', reverseAlias: 'entries'}
        ]
    }
})
await storageManager.finishInitialization()

const user = await storageManager.collection('user').createObject({
    identifier: 'email:boo@example.com',
    isActive: true,
    todoLists: [{
        title: 'Procrastinate this as much as possible',
        entries: [
            {content: 'Write intro article', done: true},
            {content: 'Write docs', done: false},
            {content: 'Publish article', done: false},
        ]
    }]
})
# user now contains things generated by underlying backend, like ids and random keys if you have such fields
console.log(user.id)

await storageManager.collection('todoList').findObjects({user: user.id}) # You can also use MongoDB-like queries
```

Further documentation
=====================

You can [find the docs here](./docs/0-start-here.md). Also, we'll be writing more and more automated tests which also serve as documentation.

Status and future development
=============================

At present, these features are implemented and tested:

- **Defining data in a DB-agnostic way as a graph of collections**: By registering your data collections with the StorageManager, you can have an easily introspectable representation of your data model
- **Automatic creation of relationships in DB-agnostic way**: One-to-one, one-to-many and many-to-many relationships declared in DB-agnostic ways are automatically being taken care of by the underlying StorageBackend on creation.
- **MongoDB-style querying:** The .findObjects() and .findOneObject() methods of a collection take MongoDB-style queries, which will then be translated by the underlying StorageBackend.
- **Client-side full-text search using Dexie backend:** By passing a stemmer into the `DexieStorageBackend({stemmer: (text : string) => Promise<string[]>})` you can full-text search text fields using the fastest client-side full-text search engine yet!
- **Run automated storage-related tests in memory:** Using the Dexie back-end, you can pass in a fake IndexedDB implementation to run your storage in-memory for faster automated and manual testing.
- **Version management of data models:** For each collection, you can pass in an array of different date-versioned collection versions, and you'll be able to iterate over your data model versions through time.

The following items are on the roadmap in no particular order:

- **Sequelize backend allowing your code to run in MySQL, PostgreSQL, MSSQL and SQLite:** [Already written](https://github.com/WorldBrain/memex-root-server/tree/master/src/components/storage/backend/sequelize), but waiting to be factored out, this allows you to write storage-related business logic portable between front- and back-end, while easily switching to non-SQL storage back-ends later if you so desire.
- **DB-agnostic data migrations:** An easy and unified way of doing data-level migrations if your data model changes, like providing defaults for new non-optional fields, splitting and merging fields, splitting and joing collections, etc.
- **Automatic relationship fetching:** This would allow passing in an extra option to find(One)Object(s) signalling the back-end to also fetch relationship, which would translate to JOINs in SQL databases and use other configurable methods in other kinds of databases.
- **Cross-relationship filters:** Filtering by relationships, like `collection('user').findObjects({'email.active': true})`
- **GraphQL server and consumer:** Allows you to start developing your application fully-client side for rapid iteration, and move the storage to the cloud when you're ready wit greatly reduced effort.
- **Field types for handling user uploads:** Allowing you to reference user uploads in your data-model, while choosing your own back-end to host them.
- **A caching layer:** Allows you to cache certain explicitly-configured queries in stores like Memcache and Redis
- **Unified access control definition:** Define the rules of who can read/write what data, which can be enforced by your API server or a Backend as a Service like Firebase.
- **Synching back-end for offline-first applications:** An aggragente back-end which intelligently writes to a client-side database first, and syncs with the server when possible.
- **Composite back-end writing to multiple back-ends at once:** When you're switching databases or cloud providers, there may be period where your application needs to the exact same data to multiple database systems at once.
- **Assisting migrations from one database to another:** Creating standard procedures allowing copying data from one database to another with any paradigm translations that might be needed.
- **Server-side full-text search server integration":** Allow for example to store your data in MondoDB, but your full-text index in ElasticSearch.
- **Pre-compiled queries:** Let the backend know which kind of queries you're going to do, so the backend can optimize compilation, and you get a unified overview of how your applcation queries and manipulates data.
- **Query analytics:** Report query performance and production usage patterns to your anaylics backend to give you insight into possible optimization opportunities (such as what kind of indices to create.)

Also, Storex was built with decentralization in mind. The first available backend is Dexie, which allows you to user data on the client side. In the future, we see it possible to create backends for decentralized systems like [DAT](https://datproject.org/) to ease the transition and integration between centralized and decentralized back-ends as easy as possible.
