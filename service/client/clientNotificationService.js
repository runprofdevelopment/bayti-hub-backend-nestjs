const admin = require("firebase-admin");
const NotificationService = require("../notificationService");
const ClientFindService = require("./clientFindService");
const ClientRepository = require("../../database/clientRepository");
const CustomError = require("../../error/customeError");
const FirebaseRepository = require("../../database/utils/firebaseRepository");

module.exports = class ClientNotificationService {
  constructor(currentUser, language) {
    this.currentUser = currentUser;
    this.language = language;
    this.notificationService = new NotificationService(this.user,
      this.currentUser,
      this.language
    );
    this.clientFindService = new ClientFindService(
      this.user,
      this.currentUser,
      this.language
    );
    this.clientRepository = new ClientRepository(
      this.user,
      this.currentUser,
      this.language
    );
  }

  async subscribeClient(client) {
    try {
      await this.notificationService.unSubscribeToTopic(
        client.deviceTokens,
        "all_client_en"
      );
      await this.notificationService.unSubscribeToTopic(
        client.deviceTokens,
        "all_client_ar"
      );

      await this.notificationService.subscribeToTopic(
        client.deviceTokens,
        client.lang === "en" ? "all_client_en" : "all_client_ar"
      );
    } catch (error) {
      throw error;
    }
  }

  async unSubscribeClient(client) {
    try {
      await this.notificationService.unSubscribeToTopic(
        client.deviceTokens,
        "all_client_en"
      );
      await this.notificationService.unSubscribeToTopic(
        client.deviceTokens,
        "all_client_ar"
      );
    } catch (error) {
      throw error;
    }
  }

  async notifyClient(clientId, title, body, data) {
    try {
      const client = await this.clientFindService.findClientById(clientId);

      if (!client) {
        throw { 
          code: 404,
          message: `There is no existing user record corresponding to the provided identifier.`
        };
      }

      const notitification = await this.notificationService.createNotificationObject(
        title,
        body,
        data
      );
      await this.addNotificationToClient(client, notitification);

      // const clientNotifications = await this.listClientNotifications(client.authenticationUid);
      // const unReadNotificationsCount = clientNotifications.reduce((prev, notitification) => prev + (notitification.isRead ? 0 : 1), 0);

      const snapshot = await admin.firestore()
        .collection(`clients/${client.id}/notifications`)
        .where('isRemoved', '==', false)
        .where('isRead', '==', false)
        .count().get();
      const unReadNotificationsCount = snapshot.data().count;

      const FCMPayLoad = await this.notificationService.createPayLoadFromNotificationObject(
        notitification,
        client.lang,
        unReadNotificationsCount
      );
      if (!FCMPayLoad.data) {
        delete FCMPayLoad.data;
      }
      await this.sendNotificationToClient(client, FCMPayLoad);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationToClient(client, payLoad) {
    const clientId = client.id;
    const isNotificationEnabled = client.notification;
    const tokens = client.deviceTokens;

    if (!isNotificationEnabled || tokens.length === 0) {
      return;
    }

    return admin
      .messaging()
      .sendToDevice(tokens, payLoad)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });
  }

  async addNotificationToClient(client, notification) {
    try {
      return await this.clientRepository.addNotificationToClient(
        client.id,
        notification
      );
    } catch (error) {
      throw error;
    }
  }

  async readNotification(authId, notificationId) {
    try {
      const client = await this.clientFindService.findClientByAuthId(authId);
      const clientId = client.id;

      const notification = await this.findNotificationById(
        clientId,
        notificationId
      );
      return await this.clientRepository.updateNotification(clientId, notificationId, { 
        isRead: true 
      });
    } catch (error) {
      throw error;
    }
  }

  async removeNotification(authId, notificationId) {
    try {
      const client = await this.clientFindService.findClientByAuthId(authId);
      const clientId = client.id;

      const notification = await this.findNotificationById(
        clientId,
        notificationId
      );
      if (notification && !notification.isRemoved) {
        await admin.firestore().doc(`clients/${clientId}/notifications/${notification.id}`).update({ 
          isRemoved: true
        })
      }
      return true;
      // return await this.clientRepository.removeNotification(
      //   clientId,
      //   notificationId
      // );
    } catch (error) {
      throw error;
    }
  }

  async findNotificationById(clientId, notificationId) {
    try {
      const notification = await this.clientRepository.findNotificationById(
        clientId,
        notificationId
      );
      if (!notification) {
        throw new CustomError(
          this.language,
          "notifications.error.wrongNotification"
        );
      }
      return notification;
    } catch (error) {
      return error;
    }
  }

  async listClientNotifications(authId, pagination) {
    const client = await this.clientFindService.findClientByAuthId(authId);
    let filter = [{ key: "isRemoved", operator: "==", value: false }];

    const clientNotification = await this.clientRepository.listClientNotifications(
      client.id,
      filter,
      pagination
    );
    return clientNotification;
  }

  async listClientAndGeneralNotifications(authId, pagination) {
    const client = await this.clientFindService.findClientByAuthId(authId);

    let filter = [{ key: "isRemoved", operator: "==", value: false }];
    
    await this._handleGeneralNotification(authId, client, pagination?.limit, pagination?.doc?.createdAt);

    const clientNotification = await this.clientRepository.listClientNotifications(
      client.id,
      filter,
      pagination,
    );
    return clientNotification;
  }

  async _handleGeneralNotification(authId, userDoc, limit, createdAtFilter) {
    try {
      const ORDER_BY = 'createdAt';
      const SORT_BY = 'desc';
      limit = (limit || 1) * 10;
      const LIMIT = limit <= 100 ? limit : 100;
  
      const client = userDoc || await this.clientFindService.findClientByAuthId(authId);
      const createdAt = client.latest_general_notification_added || client.createdAt;

      const general_notifications = FirebaseRepository.mapCollection(
        await admin.firestore().collection("notifications")
          .where('userType', '==', 'client')
          .where('createdAt', '>', createdAt)
          .orderBy(ORDER_BY, SORT_BY)
          .limit(LIMIT).get()
      );

      if (general_notifications.length) {
        const batch = await FirebaseRepository.createBatch();
        await Promise.all(
          general_notifications.map((notification) => batch.set(
            admin.firestore().doc(`clients/${client.id}/notifications/${notification.id}`), 
            { ...notification, type: 'general'}
          )),
        )
  
        const latest_notification = general_notifications[0];
        // const latest_notification = general_notifications[general_notifications.length - 1];
        if (latest_notification) {
          batch.update(admin.firestore().doc(`clients/${client.id}`), {
            latest_general_notification_added: new Date(latest_notification.createdAt),
          });
        }
  
        await FirebaseRepository.commitBatch(batch);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
};
