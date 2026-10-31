const sharedResolvers = require('../sharedResolvers');
const NotificationSendService = require('../../service/notificationSendService');
const NotificationService = require('../../service/notificationService');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listNotifications: async (parent, args, context) => {
            try {
                const pagination = args.pagination;
                const notificationService = new NotificationService(this.currentUser, this.language);
                const notifications = await notificationService.listNotifications(pagination);

                return notifications;
            } catch (error) {
                throw error
            }
        },
    },
    RootMutation: {
        sendNotificationToAllUsers: async (root, args, context) => {
            try {
                const notification = args.notification;
                const notificationSendService = new NotificationSendService(context.currentUser, context.language);
                const result = await notificationSendService.sendNotificationToAllUsers(notification, args.userType);
                return {
                    status: true,
                    result: result,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        sendNotificationToUser: async (root, args, context) => {
            try {
                const notificationSendService = new NotificationSendService(context.currentUser, context.language);
                const result = await notificationSendService.sendNotificationToUser(args.notification, args.userId, args.userType);
                return {
                    status: true,
                    result: result,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },

    }
}

module.exports = resolvers
