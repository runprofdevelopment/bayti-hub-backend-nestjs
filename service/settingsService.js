const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');
const RealTimeRepository = require('../database/realTimeRepository');

module.exports = class SettingsService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.settingsRepository = new CollectionRepository('settings');
        this.realTimeRepository = new RealTimeRepository('variables');
    }

    async updateClientPrivacyPolicy(privacyPolicy) {
        try {
            const privacyPolicyObject = {
                id: 'clientPrivacyPolicy',
                value: privacyPolicy,

                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('clientPrivacyPolicy', privacyPolicyObject);
        } catch (error) {
            throw error;
        }
    }

    async updateClientTermsAndConditions(termsAndConditions) {
        try {
            const termsAndConditionsObject = {
                id: 'clientTermsAndConditions',
                value: termsAndConditions,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('clientTermsAndConditions', termsAndConditionsObject);
        } catch (error) {
            throw error;
        }
    }

    async updateChefPrivacyPolicy(privacyPolicy) {
        try {
            const privacyPolicyObject = {
                id: 'chefPrivacyPolicy',
                value: privacyPolicy,

                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('chefPrivacyPolicy', privacyPolicyObject);
        } catch (error) {
            throw error;
        }
    }

    async updateChefTermsAndConditions(termsAndConditions) {
        try {
            const termsAndConditionsObject = {
                id: 'chefTermsAndConditions',
                value: termsAndConditions,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('chefTermsAndConditions', termsAndConditionsObject);
        } catch (error) {
            throw error;
        }
    }

    async updateCaptainPrivacyPolicy(privacyPolicy) {
        try {
            const privacyPolicyObject = {
                id: 'captainPrivacyPolicy',
                value: privacyPolicy,

                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('captainPrivacyPolicy', privacyPolicyObject);
        } catch (error) {
            throw error;
        }
    }

    async updateCaptainTermsAndConditions(termsAndConditions) {
        try {
            const termsAndConditionsObject = {
                id: 'captainTermsAndConditions',
                value: termsAndConditions,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.settingsRepository.editDocument('captainTermsAndConditions', termsAndConditionsObject);
        } catch (error) {
            throw error;
        }
    }

    async getClientPrivacyPolicy() {
        try {
            return await this.settingsRepository.findDocumentById('clientPrivacyPolicy');
        } catch (error) {
            throw error;
        }
    }

    async getClientTermsAndConditions() {
        try {
            return await this.settingsRepository.findDocumentById('clientTermsAndConditions');
        } catch (error) {
            throw error;
        }
    }

    async getChefPrivacyPolicy() {
        try {
            return await this.settingsRepository.findDocumentById('chefPrivacyPolicy');
        } catch (error) {
            throw error;
        }
    }

    async getChefTermsAndConditions() {
        try {
            return await this.settingsRepository.findDocumentById('chefTermsAndConditions');
        } catch (error) {
            throw error;
        }
    }

    async getCaptainPrivacyPolicy() {
        try {
            return await this.settingsRepository.findDocumentById('captainPrivacyPolicy');
        } catch (error) {
            throw error;
        }
    }

    async getCaptainTermsAndConditions() {
        try {
            return await this.settingsRepository.findDocumentById('captainTermsAndConditions');
        } catch (error) {
            throw error;
        }
    }

    async findSettings() {
        try {
            return await this.settingsRepository.findDocumentById('settings');
        } catch (error) {
            throw error;
        }
    }

    async updateSettings(settingsUpdate) {
        try {
            await this.settingsRepository.editDocument('settings', settingsUpdate);

            for (const property in settingsUpdate) {
                await this.realTimeRepository.setVariable(property, settingsUpdate[property]);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }


}