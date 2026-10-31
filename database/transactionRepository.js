const admin = require('firebase-admin')
const FirestoreRepositoryHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class TransactionRespository {
    constructor() {
        this.collectionName = 'transactions'
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper()
    }

    async createTransaction(transaction) {
        try {
            return await this.firestoreRepositoryHelper.setDocument
                (this.collectionName, transaction)
        } catch (error) {
            throw error
        }
    }

    async getTransactionsByTrackId(trackId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsByParamater
                (this.collectionName, 'trackId', trackId)
        } catch (error) {
            throw error
        }
    }

    async updateTransaction(transactionId, transaction) {
        try {
            return await this.firestoreRepositoryHelper.updateDocument
                (this.collectionName, transactionId, transaction)

        } catch (error) {
            throw error
        }
    }

    async getWalletTransactions(walletId, filter, pagination) {
        try {
            const updatedFilter = [
                ...filter,
                { key: 'objectId', value: walletId, operator: '==' }
            ]

            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                (this.collectionName, updatedFilter, pagination)

        } catch (error) {
            throw error
        }
    }

    async getWalletTransactionsIn(walletId, filter, pagination) {
        try {
            const updatedFilter = [
                ...filter,
                { key: 'payeeId', value: walletId, operator: '==' }
            ]

            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                (this.collectionName, updatedFilter, pagination)

        } catch (error) {
            throw error
        }
    }

    async getWalletTransactionsOut(walletId, filter, pagination) {
        try {
            const updatedFilter = [
                ...filter,
                { key: 'payerId', value: walletId, operator: '==' }
            ]

            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                (this.collectionName, updatedFilter, pagination)

        } catch (error) {
            throw error
        }
    }

    async getTransactions(filter, pagination) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                (this.collectionName, filter, pagination)
        } catch (error) {
            throw error
        }
    }

}