const admin = require('firebase-admin');
const { isFunction } = require('lodash');
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper');

module.exports = class ClientRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
        this.collectionName = 'clients';
    }

    async setClient(client) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, client);
        } catch (error) {
            throw error
        }
    }

    async findClientById(clientId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, clientId);
        } catch (error) {
            throw error
        }
    }

    async getClients(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination(this.collectionName,
                filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async editClient(uid, clientUpdate) {
        try {
            return await this.firestoreRepositroyHelper
                .updateDocument(this.collectionName, uid, clientUpdate)
        } catch (error) {
            throw error
        }
    }

    // Notifications ...........................

    async addNotificationToClient(clientId, notification) {
        const notificationObject = {
            ...notification,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, clientId, 'notifications', notificationObject)
        } catch (error) {
            throw error
        }
    }

    async findNotificationById(clientId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, clientId, 'notifications', notificationId)
        } catch (error) {
            throw error
        }
    }

    async listClientNotifications(clientId, filter, pagination) {
        try {
            console.log(clientId, filter, pagination)
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByFilterAndPagination
                (this.collectionName, clientId, 'notifications', filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async updateNotification(clientId, notificationId, notificationUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, clientId, 'notifications', notificationId, notificationUpdate)
        } catch (error) {
            throw error
        }
    }

    async removeNotification(clientId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocumentInSubCollection
                (this.collectionName, clientId, 'notifications', notificationId);
        } catch (error) {
            throw error;
        }
    }

    // Address ........................................
    async addAddress(clientId, address) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, clientId, 'addresses', address)
        } catch (error) {
            throw error
        }
    }

    async updateAddress(clientId, addressId, addressUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, clientId, 'addresses', addressId, addressUpdate)
        } catch (error) {
            throw error
        }
    }

    async getAddressesOfClient(clientId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, clientId, 'addresses', 'isRemoved', false, 'createdAt', 'desc')
        } catch (error) {
            throw error
        }
    }

    async getDefaultAddressOfClient(clientId) {
        try {
            const defaults = await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, clientId, 'addresses', 'isDefault', true)
            if (defaults.length == 0) {
                return null
            }
            return defaults[0];
        } catch (error) {
            throw error
        }
    }

    async getAddressById(clientId, addressId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, clientId, 'addresses', addressId)
        } catch (error) {
            throw error
        }
    }

}