const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class DeliveryRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
        this.collectionName = 'deliveryCompanies'
    }

    async addDeliveryCompany(deliveryCompany) {
        try {
            return await this.firestoreRepositroyHelper.setDocument
                (this.collectionName, deliveryCompany)
        } catch (error) {
            throw error
        }
    }

    async removeDeliveryCompany(deliveryCompanyId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocument
                (this.collectionName, deliveryCompanyId)
        } catch (error) {
            throw error
        }
    }

    async setDeliveryCompanyLogo(deliveryCompanyId, logo) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, deliveryCompanyId, { logo })
        } catch (error) {
            throw error
        }
    }

    async getDeliveryCompanies() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInCollection
                (this.collectionName)
        } catch (error) {
            throw error
        }

    }

    async getDeliveryCompanyById(deliveryCompanyId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, deliveryCompanyId)
        } catch (error) {
            throw error
        }
    }

}