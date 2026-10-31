const admin = require('firebase-admin');
const NotificationService = require('../notificationService');
const ChefFindService = require('../chef/chefFindService');
const ChefRepository = require('../../database/chefRepository');
const CustomError = require('../../error/customeError');
const FirebaseRepository = require("../../database/utils/firebaseRepository");

module.exports = class ChefNotificationService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.notificationService = new NotificationService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefRepository = new ChefRepository(this.currentUser, this.language);
    }

    async subscribeChef(chef) {
        try {
            await this.notificationService.unSubscribeToTopic(chef.deviceTokens, 'all_chef_en');
            await this.notificationService.unSubscribeToTopic(chef.deviceTokens, 'all_chef_ar');

            await this.notificationService.subscribeToTopic(chef.deviceTokens,
                chef.lang === 'en' ? 'all_chef_en' : 'all_chef_ar');
        } catch (error) {
            throw error;
        }
    }

    async unSubscribeChef(chef) {
        try {
            await this.notificationService.unSubscribeToTopic(chef.deviceTokens, 'all_chef_en');
            await this.notificationService.unSubscribeToTopic(chef.deviceTokens, 'all_chef_ar');

        } catch (error) {
            throw error;
        }
    }

    async notifyChef(chefId, title, body, data) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            if (!chef) {
                throw {
                    code: 404,
                    message: `There is no existing user record corresponding to the provided identifier.`
                };
            }

            const notitification = await this.notificationService.createNotificationObject(title, body, data);

            await this.addNotificationToChef(chef, notitification);

            // const chefNotifications = await this.listChefNotificationsByChefId(chefId);
            // const unReadNotificationsCount = chefNotifications.reduce((prev, notitification) => prev + (notitification.isRead ? 0 : 1), 0);

            const snapshot = await admin.firestore()
                .collection(`chefs/${chefId}/notifications`)
                .where('isRemoved', '==', false)
                .where('isRead', '==', false)
                .count().get();
            const unReadNotificationsCount = snapshot.data().count;

            const FCMPayLoad = await this.notificationService.createPayLoadFromNotificationObject
                (notitification, chef.lang, unReadNotificationsCount);

            if (!FCMPayLoad.data) {
                delete FCMPayLoad.data
            }
            await this.sendNotificationToChef(chef, FCMPayLoad);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async sendNotificationToChef(chef, payLoad) {
        const isNotificationEnabled = chef.notification
        const tokens = chef.deviceTokens

        if (!isNotificationEnabled || tokens.length === 0) {
            return
        }

        return admin.messaging().sendToDevice(tokens, payLoad)
            .then((response) => {
                //  console.log('Successfully sent message:', response);
                return response;
            })
            .catch((error) => {
                throw error
            });
    }

    async addNotificationToChef(chef, notification) {
        try {
            return await this.chefRepository.addNotificationToChef(chef.id, notification)
        } catch (error) {
            throw error
        }
    }

    async readNotification(authId, notificationId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const notification = await this.findNotificationById(chef.id, notificationId);
            return await this.chefRepository.updateNotification(chef.id, notificationId, { isRead: true });
        } catch (error) {
            throw error
        }
    }

    async removeNotification(authId, notificationId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const notification = await this.findNotificationById(chef.id, notificationId);

            if (notification && !notification.isRemoved) {
                await admin.firestore().doc(`chefs/${chef.id}/notifications/${notification.id}`).update({
                    isRemoved: true
                })
            }
            return true;
            // return await this.chefRepository.removeNotification(chef.id, notificationId);
        } catch (error) {
            throw error;
        }
    }

    async findNotificationById(chefId, notificationId) {
        try {
            const notification = await this.chefRepository.findNotificationById(chefId, notificationId)
            if (!notification) {
                throw new CustomError(this.language, 'notifications.error.wrongNotification')
            }
            return notification
        } catch (error) {
            return error
        }
    }

    async listChefNotificationsByAuthId(authId, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);

            const chefNotifications = await this.listChefNotificationsByChefId(chef.id, pagination);
            return chefNotifications
        } catch (error) {
            throw error;
        }
    }

    async listChefNotificationsByChefId(chefId, pagination) {
        const { doc, ...restPagination } = pagination || {}
        const chefData = await admin.firestore().collection('chefs').doc(chefId).get()

        let filter = [{ key: "isRemoved", operator: "==", value: false }];
        let generalNotifications = await admin.firestore().collection("notifications").where('userType', '==', 'chef').where('createdAt', '>=', new Date(new Date(chefData.data().createdAt._seconds * 1000 + chefData.data().createdAt._nanoseconds / 1e6))).limit(pagination?.limit || 10).get()
        if (pagination?.doc?.createdAt) {
            filter = [{ key: "isRemoved", operator: "==", value: false }, { key: "createdAt", operator: '<=', value: new Date(doc.createdAt) }];
            generalNotifications = await admin.firestore().collection("notifications").where('userType', '==', 'chef').where('createdAt', '>=', new Date(chefData.data().createdAt)).where('createdAt', '<=', new Date(pagination.doc.createdAt)).limit(pagination?.limit || 10).get()
        }
        const notifications = []

        if (generalNotifications && generalNotifications.docs && generalNotifications.docs.length > 0) {
            generalNotifications.docs.map((n) => {
                notifications.push({ ...n.data(), createdAt: new Date(n.data().createdAt._seconds * 1000 + n.data().createdAt._nanoseconds / 1e6) })
            })
        }
        const chefNotifications = await this.chefRepository.listChefNotifications(chefId, filter, pagination ? { ...restPagination, orderBy: "createdAt", firstPage: true } : undefined)
        let allNotifications = [...notifications, ...chefNotifications]
        allNotifications.sort((a, b) => b.createdAt - a.createdAt);
        allNotifications = allNotifications.slice(0, pagination?.limit || 10)
        return allNotifications
    }


    async listChefAndGeneralNotifications(authId, pagination) {
        const chef = await this.chefFindService.findChefByAuthId(authId);

        let filter = [{ key: "isRemoved", operator: "==", value: false }];

        await this._handleGeneralNotification(authId, chef, pagination?.limit, pagination?.doc?.createdAt);


        const chefNotifications = await this.chefRepository.listChefNotifications(
            chef.id,
            filter,
            pagination
        );
        return chefNotifications;
    }

    async _handleGeneralNotification(authId, userDoc, limit, createdAtFilter) {
        try {
            const ORDER_BY = 'createdAt';
            const SORT_BY = 'desc';
            limit = (limit || 1) * 10;
            const LIMIT = limit <= 100 ? limit : 100;

            const user = userDoc || await this.chefFindService.findChefByAuthId(authId);
            const createdAt = user.latest_general_notification_added || user.createdAt;

            const general_notifications = FirebaseRepository.mapCollection(
                await admin.firestore().collection("notifications")
                    .where('userType', '==', 'chef')
                    .where('createdAt', '>', createdAt)
                    .orderBy(ORDER_BY, SORT_BY)
                    .limit(LIMIT).get()
            );

            if (general_notifications.length) {
                const batch = await FirebaseRepository.createBatch();
                await Promise.all(
                    general_notifications.map((notification) => batch.set(
                        admin.firestore().doc(`chefs/${user.id}/notifications/${notification.id}`),
                        { ...notification, type: 'general' }
                    )),
                );

                const latest_notification = general_notifications[0];
                // const latest_notification = general_notifications[general_notifications.length - 1];
                if (latest_notification) {
                    batch.update(admin.firestore().doc(`chefs/${user.id}`), {
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