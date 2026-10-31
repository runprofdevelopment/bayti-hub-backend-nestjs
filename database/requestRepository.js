const admin = require('firebase-admin')
const FirestoreRepositoryHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class RequestRepository {
    constructor() {
        this.collectionName = 'requests'
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper()
    }

    async addWithdrawRequest(request) {
        try {
            return await this.firestoreRepositoryHelper.setDocument(this.collectionName, request)
        } catch (error) {
            throw error
        }
    }

    async getRequests(filter, pagination) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                (this.collectionName, filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async getRequestById(requestId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentById(this.collectionName, requestId)
        } catch (error) {
            throw error
        }
    }

    async updateRequest(requestId, requestUpdate) {
        try {
            return await this.firestoreRepositoryHelper.updateDocument(this.collectionName, requestId, requestUpdate)
        } catch (error) {
            throw error
        }
    }
}