const admin = require('firebase-admin');
const lodash = require('lodash');
const CustomError = require('../../error/customeError')
const FireStorePaginationHelper = require('./firestorePaginationHelper')
const FireStoreFilterHelper = require('./firestoreFilterHelper');
const { Timestamp } = require('firebase-admin/firestore');

const { slice } = require('lodash');
/*
    Implement CRUD operations for FireStore
*/
module.exports = class FirestoreRepositoryHelper {
    constructor() {
        this.fireStorePaginationHelper = new FireStorePaginationHelper()
        this.fireStoreFilterHelper = new FireStoreFilterHelper()
    }

    async newId() {
        try {
            const id = admin.firestore().collection(`ids`)
                .doc().id

            return id
        } catch (error) {
            throw error
        }
    }

    async setDocument(collectionName, doc) {
        try {
            await admin.firestore().collection(collectionName).doc(doc.id).set(doc)

            return doc
        } catch (error) {
            throw error
        }

    }

    async setDocumentInSubCollection(collectionName, parentdocId, subCollectionName, doc) {
        try {
            await admin.firestore().collection(collectionName).doc(parentdocId)
                .collection(subCollectionName).doc(doc.id).set(doc)

            return doc
        } catch (error) {
            throw error
        }
    }

    async getDocumentById(collectionName, docId) {
        try {
            const docRef = admin.firestore().collection(collectionName).doc(docId)
            const doc = await docRef.get()
            if (!doc) {
                return null
            }

            const object = doc.data()
            this.replaceAllTimestampToDate(object)

            return object
        } catch (error) {
            throw error
        }
    }

    async getDocumentInSubCollectionById(collectionName, parentdocId, subCollectionName, docId) {
        try {
            const docRef = admin.firestore().collection(collectionName).doc(parentdocId)
                .collection(subCollectionName).doc(docId)
            const doc = await docRef.get()
            if (!doc) {
                return null
            }

            const object = doc.data()
            this.replaceAllTimestampToDate(object)

            return object
        } catch (error) {
            throw error
        }
    }

    // TODO to be implemented
    async getDocumentsByIds(collectionName, ids) {

    }

    // TODO to be implemented
    async getDocumentsCountInCollection(collectionName) {

    }

    async getDocumentByParamater(collectionName, parameterName, value) {
        try {
            const docs = await this.getDocumentsByParamater(collectionName, parameterName, value)
            if (docs == null) {
                return null
            }
            this.replaceAllTimestampToDate(docs[0])

            return docs[0]
        } catch (error) {
            throw error
        }
    }

    async getDocumentsByParamater(collectionName, parameterName, value) {
        try {
            const res = await admin.firestore().collection(collectionName)
                .where(parameterName, '==', value)
                .get()

            if (!res) {
                return null
            }

            const docs = this.mapCollection(res)
            return docs
        } catch (error) {
            throw error
        }
    }

    async getDocumentsInSubCollectionByParamater(collectionName, parentDocId, subCollectionName, parameterName, value, orderBy = null, sortBy = 'asc') {
        try {
            let res = admin.firestore().collection(collectionName).doc(parentDocId)
                .collection(subCollectionName).where(parameterName, '==', value)

            if (orderBy) {
                res = await res.orderBy(orderBy, sortBy).get()
            } else {
                res = await res.get()
            }


            if (!res) {
                return null
            }

            const docs = this.mapCollection(res)
            return docs
        } catch (error) {
            throw error
        }
    }

    async getDocumentsByFilter(collectionName, filter) {
        try {
            let docsRef = admin.firestore().collection(collectionName)

            // Apply Filter
            docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter)
            const res = await docsRef.get()
            const docs = this.mapCollection(res)

            return docs
        } catch (error) {
            throw error
        }
    }

    async listCollectionGroup(collectionName, { filter, orderBy, pagination }) {
        const FirebaseHelper = require('../utils-v2/firebaseHelper');
        return await FirebaseHelper.listWithPagination({
            // filter: this.generateFilter(), 
            collectionPath: collectionName,
            filter: filter,
            orderBy,
            pagination,
            queryType: 'group',
        })
    }
    // async listCollectionGroup(collectionName, filter, pagination) {
    //     try {
    //         let docsRef = admin.firestore().collectionGroup(collectionName);

    //         // Apply filter
    //         docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter);

    //         // Apply pagination
    //         docsRef = await this.fireStorePaginationHelper.applyPagination(docsRef, pagination);

    //         let docs = this.mapCollection(await docsRef.get());
    //         if (pagination?.offset) {
    //             docs = docs.slice(pagination?.offset);
    //         }

    //         return docs
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async getDocumentsByFilterAndPagination(collectionName, filter, pagination) {
        try {
            let docsRef = admin.firestore().collection(collectionName)
            // Apply filter
            docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter)

            // Apply pagination
            docsRef = await this.fireStorePaginationHelper.applyPagination(docsRef, pagination)
            const res = await docsRef.get();
            let docs = this.mapCollection(res);
            if (pagination?.offset) {
                docs = docs.slice(pagination?.offset);
            }

            return docs
        } catch (error) {
            throw error
        }
    }

    async getDocumentsInSubCollectionByFilterAndPagination(collectionName, docId, subCollectionName, filter, pagination) {
        try {
            let docsRef = admin.firestore().collection(collectionName).doc(docId).collection(subCollectionName)
            docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter)

            // Adding pagination
            docsRef = await this.fireStorePaginationHelper.applyPagination(docsRef, pagination);
            const res = await docsRef.get();
            let docs = this.mapCollection(res);
            if (pagination?.offset) {
                docs = docs.slice(pagination?.offset);
            }

            return docs
        } catch (error) {
            throw error
        }
    }

    mapDateToTimeStampIfFound(filter) {
        try {
            for (const fi of filter) {
                const date = new Date(fi.value)
                if (fi.value && date instanceof Date && !isNaN(date)) {
                    fi.value = admin.firestore.Timestamp.fromDate(date)
                }
            }
        } catch (error) {
            throw error
        }
    }

    async updateDocument(collection, docId, updateObject) {
        try {
            await admin.firestore().collection(collection).doc(docId).set(
                updateObject,
                { merge: true })

            return true
        } catch (error) {
            throw error
        }
    }

    async updateDocumentInSubCollection(collectionName, parentdocId, subCollectionName,
        docId, updateObject) {
        try {
            await admin.firestore().collection(collectionName).doc(parentdocId)
                .collection(subCollectionName).doc(docId).set(
                    updateObject,
                    { merge: true })

            return true
        } catch (error) {
            throw error
        }
    }

    async getDocumentsInCollection(collectionName) {
        try {
            const snapshot = await admin.firestore().collection(collectionName).get()
            const docs = this.mapCollection(snapshot)

            return docs
        } catch (error) {
            throw error
        }
    }

    async getDocumentsInSubCollection(collectionName, parentDocId, subCollectionName) {
        try {
            const snapshot = await admin.firestore().collection(collectionName).doc(parentDocId)
                .collection(subCollectionName).get()
            const docs = this.mapCollection(snapshot)

            return docs
        } catch (error) {
            throw error
        }
    }

    async getDocumentsInSubCollectionByFilter(collectionName, docId, subCollectionName, filter) {
        try {
            try {
                let docsRef = admin.firestore().collection(collectionName).doc(docId).collection(subCollectionName)
                docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter)

                const res = await docsRef.get()
                const docs = this.mapCollection(res)

                return docs
            } catch (error) {
                throw error
            }
        } catch (error) {
            throw error;
        }
    }

    async removeDocument(collectionName, docId) {
        await admin.firestore().collection(collectionName).doc(docId).delete()
        return true
    }

    async removeDocumentInSubCollection(collectionName, parentDocId, subCollectionName, docId) {
        await admin.firestore().collection(collectionName).doc(parentDocId)
            .collection(subCollectionName).doc(docId).delete();
        return true;
    }

    mapCollection(collection) {
        if (collection.empty) {
            return []
        }

        const list = []

        collection.forEach((document) => {
            const item = Object.assign({}, document.data(), {
                id: document.data().id || document.id,
            })

            this.replaceAllTimestampToDate(item)
            list.push(item)
        });

        return list;
    }

    replaceTimestampToDate(date) {
        if (date && date instanceof admin.firestore.Timestamp) {
            return date.toDate();
        }
        return date
    }

    replaceAllTimestampToDate(arg) {
        if (!arg) {
            return arg;
        }

        Object.keys(arg).forEach((key) => {
            if (
                arg[key] &&
                arg[key] instanceof Timestamp
            ) {
                arg[key] = arg[key].toDate();
            }
        });
    }

}