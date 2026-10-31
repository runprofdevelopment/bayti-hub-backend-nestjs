const admin = require('firebase-admin');
const NotificationService = require('../notificationService')
const CaptainFindService = require('./captainFindService')
const CaptainRepository = require('../../database/captainRepository')
const FirebaseRepository = require("../../database/utils/firebaseRepository");

module.exports = class CaptainNotificationService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.notificationService = new NotificationService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.captainRepository = new CaptainRepository(this.currentUser, this.language);
    }

    async subscribeCaptain(captain) {
        try {
            await this.notificationService.unSubscribeToTopic(captain.deviceTokens, 'all_captain_en');
            await this.notificationService.unSubscribeToTopic(captain.deviceTokens, 'all_captain_ar');

            await this.notificationService.subscribeToTopic(captain.deviceTokens,
                captain.lang === 'en' ? 'all_captain_en' : 'all_captain_ar');
        } catch (error) {
            throw error;
        }
    }

    async unSubscribeCaptain(captain) {
        try {
            await this.notificationService.unSubscribeToTopic(captain.deviceTokens, 'all_captain_en');
            await this.notificationService.unSubscribeToTopic(captain.deviceTokens, 'all_captain_ar');
        } catch (error) {
            throw error;
        }
    }

    async notifyCaptain(captainId, title, body, data) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);

            if (!captain) {
                throw {
                    code: 404,
                    message: `There is no existing user record corresponding to the provided identifier.`
                };
            }

            const notitification = await this.notificationService.createNotificationObject(title, body, data);
            await this.addNotificationToCaptain(captain, notitification);

            // const captainNotifications = await this.listCaptainNotifications(captainId);
            // const unReadNotificationsCount = captainNotifications.reduce((prev, notitification) => prev + (notitification.isRead ? 0 : 1), 0);

            const snapshot = await admin.firestore()
                .collection(`captains/${captainId}/notifications`)
                .where('isRemoved', '==', false)
                .where('isRead', '==', false)
                .count().get();
            const unReadNotificationsCount = snapshot.data().count;

            const FCMPayLoad = await this.notificationService.createPayLoadFromNotificationObject
                (notitification, captain.lang, unReadNotificationsCount);
            if (!FCMPayLoad.data) {
                delete FCMPayLoad.data
            }
            await this.sendNotificationToCaptain(captain, FCMPayLoad);

            return true;
        } catch (error) {
            throw error
        }
    }

    async sendNotificationToCaptain(captain, payLoad) {
        const isNotificationEnabled = captain.notification;
        const tokens = captain.deviceTokens;

        if (!isNotificationEnabled || tokens.length === 0) {
            return
        }

        return admin.messaging().sendToDevice(tokens, payLoad)
            .then((response) => {
                //console.log('Successfully sent message:', response);
                return response
            })
            .catch((error) => {
                // console.log('[sendToDevice] Error sending message:', error);
                throw error
            });
    }

    async addNotificationToCaptain(captain, notification) {
        try {
            return await this.captainRepository.addNotificationToCaptain(captain.id, notification)
        } catch (error) {
            throw error
        }
    }

    async readNotification(authId, notificationId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const notification = await this.findNotificationById(captain.id, notificationId);

            return await this.captainRepository.updateNotification(captain.id, notification.id, { isRead: true });
        } catch (error) {
            throw error;
        }
    }

    async removeNotification(authId, notificationId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const notification = await this.findNotificationById(captain.id, notificationId);

            if (notification && !notification.isRemoved) {
                await admin.firestore().doc(`captains/${captain.id}/notifications/${notification.id}`).update({
                    isRemoved: true
                })
            }
            return true;
            // return await this.captainRepository.removeNotification(captain.id, notification.id);
        } catch (error) {
            throw error;
        }
    }

    async findNotificationById(captainId, notificationId) {
        try {
            const notification = await this.captainRepository.findNotificationById(captainId, notificationId)
            if (!notification) {
                throw new CustomError(this.language, 'notifications.error.wrongNotification')
            }
            return notification
        } catch (error) {
            return error
        }
    }

    async listCaptainsNotificationsByAuthId(authId, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const captainNotifications = await this.listCaptainNotifications(captain.id, pagination);
            return captainNotifications
        } catch (error) {
            throw error;
        }
    }

    async listCaptainNotifications(captain, pagination) {
        const { doc, ...restPagination } = pagination || {}
        const captainData = await admin.firestore().collection('captains').doc(captain).get()
        let filter = [{ key: "isRemoved", operator: "==", value: false }];
        let generalNotifications = await admin.firestore().collection("notifications").where('userType', '==', 'captain').where('createdAt', '>=', new Date(new Date(captainData.data().createdAt._seconds * 1000 + captainData.data().createdAt._nanoseconds / 1e6))).limit(pagination?.limit || 10).get()
        if (pagination?.doc?.createdAt) {
            filter = [{ key: "isRemoved", operator: "==", value: false }, { key: "createdAt", operator: '<=', value: new Date(doc.createdAt) }];
            generalNotifications = await admin.firestore().collection("notifications").where('userType', '==', 'captain').where('createdAt', '>=', new Date(captainData.data().createdAt)).where('createdAt', '<=', new Date(pagination.doc.createdAt)).limit(pagination?.limit || 10).get()
        }
        const notifications = []

        if (generalNotifications && generalNotifications.docs && generalNotifications.docs.length > 0) {
            generalNotifications.docs.map((n) => {
                notifications.push({ ...n.data(), createdAt: new Date(n.data().createdAt._seconds * 1000 + n.data().createdAt._nanoseconds / 1e6) })
            })
        }
        const captainNotifications = await this.captainRepository.listCpatainNotifications(captain, filter, pagination ? { ...restPagination, orderBy: "createdAt", firstPage: true } : undefined);
        let allNotification = [...captainNotifications, ...notifications]
        allNotification.sort((a, b) => b.createdAt - a.createdAt);
        allNotification = allNotification.slice(0, pagination?.limit || 10)
        return allNotification
    }

    async listCaptainAndGeneralNotifications(authId, pagination) {
        const captain = await this.captainFindService.findCaptainByAuthId(authId);
        let filter = [{ key: "isRemoved", operator: "==", value: false }];

        await this._handleGeneralNotification(authId, captain, pagination?.limit, pagination?.doc?.createdAt);

        const captainNotifications = await this.captainRepository.listCpatainNotifications(
            captain.id,
            filter,
            pagination
        );
        return captainNotifications;
    }

    async _handleGeneralNotification(authId, userDoc, limit, createdAtFilter) {
        try {
            const ORDER_BY = 'createdAt';
            const SORT_BY = 'desc';
            limit = (limit || 1) * 10;
            const LIMIT = limit <= 100 ? limit : 100;

            const user = userDoc || await this.captainFindService.findCaptainByAuthId(authId);
            const createdAt = user.latest_general_notification_added || user.createdAt;

            const general_notifications = FirebaseRepository.mapCollection(
                await admin.firestore().collection("notifications")
                    .where('userType', '==', 'captain')
                    .where('createdAt', '>', createdAt)
                    .orderBy(ORDER_BY, SORT_BY)
                    .limit(LIMIT).get()
            );

            if (general_notifications.length) {
                const batch = await FirebaseRepository.createBatch();
                await Promise.all(
                    general_notifications.map((notification) => batch.set(
                        admin.firestore().doc(`captains/${user.id}/notifications/${notification.id}`),
                        { ...notification, type: 'general' }
                    )),
                );

                // const latest_notification = general_notifications[general_notifications.length - 1];
                const latest_notification = general_notifications[0];
                if (latest_notification) {
                    batch.update(admin.firestore().doc(`captains/${user.id}`), {
                        latest_general_notification_added: new Date(latest_notification.createdAt),
                    });
                }

                await FirebaseRepository.commitBatch(batch);
            }
        } catch (error) {
            throw new Error(error);
        }
    }

}