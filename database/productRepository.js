const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class ProductRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
        this.collectionName = 'products'
    }

    async addProduct(product) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, product)
        } catch (error) {
            throw error
        }
    }

    async updateProduct(productId, productUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, productId, productUpdate)
        } catch (error) {
            throw error
        }
    }

    async getProduct(productId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, productId)
        } catch (error) {
            throw error
        }
    }

    async listProducts(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination(this.collectionName,
                filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async productClicked(productId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, productId, { clicks: admin.firestore.FieldValue.increment(1) })
        } catch (error) {
            throw error
        }
    }

    async removeProductPermenantly(productId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocument(this.collectionName, productId)
        } catch (error) {
            throw error
        }
    }

}