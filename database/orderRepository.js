const admin = require('firebase-admin')
const FirebaseRepository = require('./utils/firebaseRepository')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class OrderRepository {
    constructor() {
        this.collectionName = 'orders'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async addOrder(order) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, order)
        } catch (error) {
            throw error
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, orderId,
                { status })
        } catch (error) {
            throw error
        }
    }

    async getOrderById(orderId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, orderId)
        } catch (error) {
            throw error
        }
    }

    async updateOrder(orderId, update) {
        return await this.firestoreRepositroyHelper.updateDocument
            (this.collectionName, orderId, update)
    }

    async getOrders(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination
                (this.collectionName, filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async getOrdersWithoutPagination(filter){
        try{
            return this.firestoreRepositroyHelper.getDocumentsByFilter(this.collectionName, filter)
        }catch(error){
            throw error
        }
    }
}