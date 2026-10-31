const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper');

module.exports = class CollectionRepository {
    constructor(collectionName) {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
        this.collectionName = collectionName;
    }

    async setDocument(document) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, document);
        } catch (error) {
            throw error;
        }
    }

    async findDocumentById(docId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, docId);
        } catch (error) {
            throw error;
        }
    }

    async listDocuments(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination
                (this.collectionName, filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async listDocumentsByFilter(filter) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilter(this.collectionName, filter);
        } catch (error) {
            throw error;
        }
    }

    async getDocuments() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInCollection(this.collectionName);
        } catch (error) {
            throw error;
        }
    }

    async editDocument(docId, documentUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, docId, documentUpdate);
        } catch (error) {
            throw error
        }
    }

    async removeDocument(docId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocument(this.collectionName, docId);
        } catch (error) {
            throw error;
        }
    }

}