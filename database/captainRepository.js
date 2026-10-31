const admin = require('firebase-admin');
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper');
const {  Timestamp } = require('firebase-admin/firestore');

module.exports = class CaptainRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
        this.collectionName = 'captains';
    }

    async setCaptain(captain) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, captain);
        } catch (error) {
            throw error;
        }
    }

    async findCaptainById(captainId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, captainId);
        } catch (error) {
            throw error;
        }
    }

    async getCaptains(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination(this.collectionName,
                filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async editCaptain(captainId, captainUpdate) {
        try {
            return await this.firestoreRepositroyHelper
                .updateDocument(this.collectionName, captainId, captainUpdate);
        } catch (error) {
            throw error
        }
    }


    async addNotificationToCaptain(captainId, notification) {
        const notificationObject = {
            ...notification,
            createdAt: new Date()
        }
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, captainId, 'notifications', notificationObject);
        } catch (error) {
            throw error;
        }
    }

    async findNotificationById(captainId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, captainId, 'notifications', notificationId);
        } catch (error) {
            throw error
        }
    }

    async listCpatainNotifications(captainId, filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByFilterAndPagination
                (this.collectionName, captainId, 'notifications', filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async updateNotification(captainId, notificationId, notificationUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, captainId, 'notifications', notificationId, notificationUpdate);
        } catch (error) {
            throw error
        }
    }

    async removeNotification(captainId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocumentInSubCollection
                (this.collectionName, captainId, 'notifications', notificationId);
        } catch (error) {
            throw error;
        }
    }

    // Bank accounts................................................................
    async addBankAccount(captainId, bankAccount) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, captainId, 'bankAccounts', bankAccount)
        } catch (error) {
            throw error
        }
    }

    async getDefaultBankAccountOfCaptain(captainId) {
        try {
            const defaults = await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, captainId, 'bankAccounts', 'isDefault', true)
            if (defaults.length == 0) {
                return null
            }
            return defaults[0]
        } catch (error) {
            throw error
        }
    }

    async getBankAccountsOfCaptain(captainId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, captainId, 'bankAccounts', 'isRemoved', false)
        } catch (error) {
            throw error
        }
    }

    async getCaptainBankAccountById(captainId, bankAccountId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, captainId, 'bankAccounts', bankAccountId)
        } catch (error) {
            throw error
        }
    }

    async updateBankAccount(captainId, bankAccountId, bankAccountUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, captainId, 'bankAccounts', bankAccountId, bankAccountUpdate)
        } catch (error) {
            throw error
        }
    }
    //..........................................................................................
}