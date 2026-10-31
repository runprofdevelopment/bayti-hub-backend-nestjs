const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')


module.exports = class PromoRepository {
    constructor() {
        this.collectionName = 'promos'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async addPromoCode(promoCode) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, promoCode)
        } catch (error) {
            throw error
        }
    }

    async setPromoCodeStatus(promoCodeId, status) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, promoCodeId,
                { status })
        } catch (error) {
            throw error
        }
    }

    async getPromoCodes(pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination(this.collectionName,
                [], pagination)
        } catch (error) {
            throw error
        }

    }

    async getPromoCodeByCode(promoCode) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentByParamater
                (this.collectionName, 'code', promoCode)
        } catch (error) {
            throw error
        }
    }

    async incrementPromoUses(promoCodeId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, promoCodeId, { totalUses: admin.firestore.FieldValue.increment(1) })
        } catch (error) {
            throw error
        }
    }

}