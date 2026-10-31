const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')


module.exports = class PromoRepository {
    constructor() {
        this.collectionName = 'sliders'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async addSlider(slider) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, slider)
        } catch (error) {
            throw error
        }
    }

    async getSliders() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInCollection(this.collectionName)
        } catch (error) {
            throw error
        }

    }

    async removeSlider(sliderId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocument(this.collectionName, sliderId)
        } catch (error) {
            throw error
        }
    }

    async getSliderById(sliderId) {
        try {
            return this.firestoreRepositroyHelper.getDocumentById(this.collectionName, sliderId)
        } catch (error) {
            throw error
        }
    }

    async updateSlider(sliderId, sliderUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, sliderId, sliderUpdate)
        } catch (error) {
            throw error
        }
    }
}