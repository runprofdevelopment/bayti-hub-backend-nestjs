const admin = require('firebase-admin');
const ClientNotificationService = require('./client/clientNotificationService');
const ChefNotificationService = require('./chef/chefNotificationService');
const CaptainNotificationService = require('./captain/captainNotificationService');
const CollectionRepository = require('../database/collectionRepository');

module.exports = class NotificationService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.notificationRepository = new CollectionRepository("notifications");
    }

    async sendNotificationToUser(notification, userId, userType) {
        try {
            if (userType === "client") {
                return await this.clientNotificationService.notifyClient(userId, notification.title, notification.body, notification.data);
            } else if (userType === "chef") {
                return await this.chefNotificationService.notifyChef(userId, notification.title, notification.body, notification.data);
            } else if (userType === "captain") {
                return await this.captainNotificationService.notifyCaptain(userId, notification.title, notification.body, notification.data);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async sendNotificationToAllUsers(data, userType) {
        try {
            let topicEn = "", topicAr = "";

            switch (userType) {
                case "client":
                    topicEn = "all_client_en";
                    topicAr = "all_client_ar";
                    break;
                case "chef":
                    topicEn = "all_chef_en";
                    topicAr = "all_chef_ar";
                    break;
                case "captain":
                    topicEn = "all_captain_en";
                    topicAr = "all_captain_ar";
                    break;
            }
            const uid = this.currentUser.uid

            const notificationObject = {
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                ...data,
                isRemoved: false,
                isRead: false,
                userType,
                clientId: 'all',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
            }

            const ENFCMPayLoad = {
                notification: {
                    title: data.title.en,
                    body: data.body.en,
                },
                data: data.data,
                topic: topicEn
            }

            const ARFCMPayLoad = {
                notification: {
                    title: data.title.ar,
                    body: data.body.ar,
                },
                data: data.data,
                topic: topicAr
            }

            await admin.messaging().send(ENFCMPayLoad)
            await admin.messaging().send(ARFCMPayLoad)

            const resNotification = await this.notificationRepository.setDocument(notificationObject);

            //TODO set notification for all clients
            return resNotification
        } catch (error) {
            throw error;
        }
    }
}