const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class SettingsRepository {
    constructor() {
        this.collectionName = 'settings'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async updateClientPrivacyPolicy(privacyPolicy) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'clientPrivacyPolicy', privacyPolicy)
        } catch (error) {
            throw error
        }
    }

    async updateClientTermsAndConditions(termsAndConditions) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'clientTermsAndConditions', termsAndConditions)
        } catch (error) {
            throw error
        }
    }

    async getClientPrivacyPolicy() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'clientPrivacyPolicy')
        } catch (error) {
            throw error
        }
    }

    async getClientTermsAndConditions() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'clientTermsAndConditions')
        } catch (error) {
            throw error
        }
    }

    async updateChefPrivacyPolicy(privacyPolicy) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'chefPrivacyPolicy', privacyPolicy)
        } catch (error) {
            throw error
        }
    }

    async updateChefTermsAndConditions(termsAndConditions) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'chefTermsAndConditions', termsAndConditions)
        } catch (error) {
            throw error
        }
    }

    async getChefPrivacyPolicy() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'chefPrivacyPolicy')
        } catch (error) {
            throw error
        }
    }

    async getChefTermsAndConditions() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'chefTermsAndConditions')
        } catch (error) {
            throw error
        }
    }

    async updateCaptainPrivacyPolicy(privacyPolicy) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'captainPrivacyPolicy', privacyPolicy)
        } catch (error) {
            throw error
        }
    }

    async updateCaptainTermsAndConditions(termsAndConditions) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'captainTermsAndConditions', termsAndConditions)
        } catch (error) {
            throw error
        }
    }

    async getCaptainPrivacyPolicy() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'captainPrivacyPolicy')
        } catch (error) {
            throw error
        }
    }

    async getCaptainTermsAndConditions() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'captainTermsAndConditions')
        } catch (error) {
            throw error
        }
    }

    async updateSettings(settingsUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, 'settings', settingsUpdate);
        } catch (error) {
            throw error;
        }
    }

    async getSettings() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, 'settings');
        } catch (error) {
            throw error;
        }
    }

}