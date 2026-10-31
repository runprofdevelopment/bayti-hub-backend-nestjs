const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');
const {  Timestamp } = require('firebase-admin/firestore');
module.exports = class NotificationService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.notificationRepository = new CollectionRepository("notifications");
    }

    async createNotificationObject(title, body, data) {
        try {
            const notification = {
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                isRead: false,
                isRemoved: false,
                action: null,
                image: null,
                title,
                body,
                data,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            if (!data) {
                delete notification.data;
            }

            return notification;
        } catch (error) {
            throw error
        }

    }

    async createPayLoadFromNotificationObject(notificationObject, language, badgeCount) {
        try {
            const FCMPayLoad = {
                notification: {
                    title: language === 'en' ? notificationObject.title.en : notificationObject.title.ar,
                    body: language === 'en' ? notificationObject.body.en : notificationObject.body.ar,
                    sound: 'UBNotification.mp3', 
                },
                data: notificationObject.data
            }

            if(badgeCount){
                FCMPayLoad.notification.badge = badgeCount+"";
            }

            return FCMPayLoad;
        } catch (error) {
            throw error;
        }
    }

    async subscribeToTopic(tokens, topic) {
        try {
            if (!tokens || tokens.length === 0) {
                return;
            }
            await admin.messaging().subscribeToTopic(tokens, topic);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async unSubscribeToTopic(tokens, topic) {
        try {
            if (!tokens || tokens.length === 0) {
                return;
            }
            await admin.messaging().unsubscribeFromTopic(tokens, topic);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async listNotifications(pagination) {
        try {
            return await this.notificationRepository.listDocuments([], pagination);
        } catch (error) {
            throw error;
        }
    }

}