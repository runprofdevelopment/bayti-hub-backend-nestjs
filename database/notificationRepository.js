const admin = require('firebase-admin')
const FirestoreRepositoryHelper = require('./helper/firestoreRepositoryHelper')
const CustomError = require('../error/customeError')

module.exports = class TransactionRespository {
    constructor() {
        this.collectionName = 'users'
        this.subCollectionName = 'notifications'
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper()
    }

    async getNotificationsForUser(userId, pagination) {
        try {
            const filter = [{ key: 'isRemoved', value: false, operator: '==' }]
            return await this.firestoreRepositoryHelper.getDocumentsInSubCollectionByFilterAndPagination
                (this.collectionName, userId, this.subCollectionName, filter, pagination)
        } catch (error) {
            throw error
        }
    }

    async readNotification(userId, notificationId) {
        try {
            const notitification = await admin.firestore().collection('users')
                .doc(userId).collection('notifications')
                .doc(notificationId).get()
            if (!notitification) {
                throw new CustomError('en', 'notitifications.error.wrongNotification')
            }
            return await this.firestoreRepositoryHelper.updateDocumentInSubCollection
                (this.collectionName, userId, this.subCollectionName, notificationId, { isRead: true })
        } catch (error) {
            throw error
        }
    }

    async removeNotification(userId, notificationId) {
        try {
            const notitification = await admin.firestore().collection('users')
                .doc(userId).collection('notifications')
                .doc(notificationId).get()
            if (!notitification) {
                throw new CustomError('en', 'notitifications.error.wrongNotification')
            }
            return await this.firestoreRepositoryHelper.updateDocumentInSubCollection
                (this.collectionName, userId, this.subCollectionName, notificationId, { isRemoved: true })
        } catch (error) {
            throw error
        }
    }

    async getNotificationById(notificationId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentById('notifications', notificationId)
        } catch (error) {
            throw error
        }
    }

    async addNotification(notification) {
        try {
            return await this.firestoreRepositoryHelper.setDocument('notifications', notification)
        } catch (error) {
            throw error
        }
    }

    async listNotifications(pagination) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsByFilterAndPagination
                ('notifications', [], pagination)
        } catch (error) {
            throw error
        }

    }

    async addNotificationToUsers(notification, users) {
        try {
            const batch = admin.firestore().batch()
            users.forEach(user => {
                const userRef = admin.firestore().collection('users').doc(user.id)
                    .collection('notifications').doc(notification.id)
                batch.set(userRef, notification)
            });
            await batch.commit()
        } catch (error) {
            throw error
        }
    }

    async findNotificationById(notificaitonId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentById('notifications', notificaitonId)
        } catch (error) {
            throw error
        }
    }
}