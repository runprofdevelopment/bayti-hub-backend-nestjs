const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper');

module.exports = class SubCollectionRepository {
    constructor(collectionName, subCollectionName) {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
        this.collectionName = collectionName;
        this.subCollectionName = subCollectionName;
    }

    async setDocument(parentDocId, document) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, parentDocId, this.subCollectionName, document);
        } catch (error) {
            throw error;
        }
    }

    async findDocumentById(parentDoctId, docId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, parentDoctId, this.subCollectionName, docId);
        } catch (error) {
            throw error;
        }
    }

    async listDocuments(parentDocId, filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByFilterAndPagination
                (this.collectionName, parentDocId, this.subCollectionName, filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async listDocumentsByFilter(parentDocId, filter) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByFilter
                (this.collectionName, parentDocId, this.subCollectionName, filter);
        } catch (error) {
            throw error;
        }
    }

    async getDocuments(parentDocId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollection
                (this.collectionName, parentDocId, this.subCollectionName);
        } catch (error) {
            throw error;
        }
    }

    async editDocument(parentDocId, docId, subCollectionUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, parentDocId, this.subCollectionName, docId, subCollectionUpdate);
        } catch (error) {
            throw error
        }
    }

    async removeDocument(parentDocId, docId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocumentInSubCollection
                (this.collectionName, parentDocId, this.subCollectionName, docId);
        } catch (error) {
            throw error;
        }
    }

}