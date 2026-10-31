const admin = require('firebase-admin');
const functions = require("firebase-functions");
const OrderFindService = require('./orderFindService');
const CaptainFindService = require('../captain/captainFindService');
const CaptainEditService = require('../captain/captainEditService');
const OrderEditService = require('./orderEditService');
const CustomError = require('../../error/customeError');
const CaptainNotificationService = require('../captain/captainNotificationService');
const ClientNotificationService = require('../client/clientNotificationService');

const { i18n } = require('../../i18n');
const CaptainAvailibilityService = require('../captain/captainAvailibilityService');
const FirestoreRepositoryHelper = require('../../database/helper/firestoreRepositoryHelper');

const REGION = 'europe-west1'

module.exports = class OrderCaptainService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.orderEditService = new OrderEditService(this.currentUser, this.language);
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.captainAvailabilityService = new CaptainAvailibilityService(this.currentUser, this.language);
    }

    async decideOrderDelivery(authId, orderId, decision) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const order = await this.orderFindService.findOrderById(orderId);

            // check if the pending order the same the specified order
            // the captain must not be delivering any orders
            // the order must not have captain assigned
            if (!captain.pendingOrderId || captain.deliveringOrderId || captain.pendingOrderId !== order.id
                || order.captainId) {
                throw new CustomError(this.language, 'order.error.orderNotAvailable');
            }

            if (decision) {
                await this.assignOrderToCaptain(order, captain);
                // remove this order from all captains
                const filter = [
                    { key: "pendingOrderId", operator: "==", value: orderId }
                ]
                const captains = await this.captainFindService.listCaptains(filter, null);
                const promises = captains.map(captain => this.captainEditService.editCaptain(captain, {
                    pendingOrderId: null,
                    pendingOrder: null,
                    pendingOrderTime: null,
                }));

                await Promise.all(promises);
            } else {
                // remove pending orders from captain
                await this.captainEditService.editCaptain(captain,
                    {
                        pendingOrderId: null,
                        pendingOrder: null,
                        pendingOrderTime: null,
                    });
            }

            const visits = order.visits;
            for (const visit of visits) {
                if (visit.captainId === captain.id) {
                    visit.responded = true;
                }
            }
            await this.orderEditService.editOrder(order, { visits });

        } catch (error) {
            throw error;
        }
    }

    async removePendingOrdersFromCaptains() {
        try {
            const filter = [
                { key: "pendingOrderId", operator: "notEqual", value: null }
            ]
            const captains = await this.captainFindService.listCaptains(filter, undefined);
            const promises = [];
            for (const captain of captains) {
                promises.push(this.captainEditService.editCaptain(captain, {
                    pendingOrderId: null,
                    pendingOrder: null,
                    pendingOrderTime: null
                }));
            }

            await Promise.all(promises);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async assignOrderToCaptainByIds(orderId, captainId) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            const order = await this.orderFindService.findOrderById(orderId);

            return await this.assignOrderToCaptain(order, captain);
        } catch (error) {
            throw error;
        }
    }

    async assignOrderToCaptain(order, captain) {
        try {
            if (order.status !== "inProgress") {
                throw new CustomError(this.language, 'order.error.wrongStatus');
            }

            if (captain.isRemoved || !captain.isEnabled) {
                throw new CustomError(this.language, 'captain.error.captainNotFound');
            }

            if (captain.deliveringOrderId) {
                throw new CustomError(this.language, 'captain.error.captainHashOrder');
            }

            if (order.captainId) {
                throw new CustomError(this.language, 'captain.error.orderHasCaptain');
            }

            // get all captains with pending order id and remove the order from them
            const pendingCaptains = await this.captainFindService.listCaptains([
                { key: "pendingOrderId", operator: "==", value: order.id}
            ]);
            const promises = pendingCaptains.map(captain => this.captainEditService.editCaptain(captain,
                {
                    pendingOrderId: null,
                    pendingOrder: null,
                    pendingOrderTime: null,
                }));
            await Promise.all(promises);

            // edit captain with order
            await this.captainEditService.editCaptain(captain,
                {
                    pendingOrderId: null,
                    pendingOrder: null,
                    pendingOrderTime: null,
                    deliveringOrderId: order.id,
                    deliveringOrder: order
                });
            // edit order to be assigned to the captain and edit its status to be delivering
            await this.orderEditService.editOrder(order, { captainId: captain.id, captain });

            // notify captain
            await this.captainNotificationService.notifyCaptain(captain.id, {
                en: i18n('en', 'order.notification.orderAssignedTitle'),
                ar: i18n('ar', 'order.notification.orderAssignedTitle')
            }, {
                en: `${i18n('en', 'order.notification.orderAssignedBody')} ${order.orderNo}`,
                ar: `${i18n('ar', 'order.notification.orderAssignedBody')} ${order.orderNo}`,
            }, {
                key: 'deliveryOrder',
                value: `${order.id}`
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async cancelAssignOrderToCaptain(orderId, captainId) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            const order = await this.orderFindService.findOrderById(orderId);
            console.log(order.status);
            if (order.status !== "inProgress") {
                throw new CustomError(this.language, 'order.error.wrongStatus');
            }

            if (captain.isRemoved || !captain.isEnabled) {
                throw new CustomError(this.language, 'captain.error.captainNotFound');
            }

            // Remover the order from the captain
            await this.captainEditService.editCaptain(captain, {
                // pendingOrderId: null,
                // pendingOrder: null,
                // pendingOrderTime: null,
                deliveringOrderId: null,
                deliveringOrder: null
            });

            // Edit order to be cancel assigned to the captain and edit its status to be inProgress
            await this.orderEditService.editOrder(order, { 
                captainId: null, 
                captain: null,
                status: 'inProgress',
            });

            // Notify captain
            await this.captainNotificationService.notifyCaptain(captain.id, {
                en: 'Cancel delivery order',
                ar: `تم إلغاء تسليم الطلب`
            }, {
                en: `Delivery of order number ${order.orderNo} has been cancelled`,
                ar: `تم إلغاء تسليم الطلب رقم ${order.orderNo}`,
            }, {
                key: 'cancelDeliveryOrder',
                value: `${order.id}`
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async handOrderToCaptain(authId, orderId, QRCode) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const captain = await this.captainFindService.findCaptainByAuthId(authId);

            if (order.status !== "inProgress") {
                throw new CustomError(this.language, 'order.error.wrongStatus');
            }

            if (QRCode !== order.QRCode) {
                throw new CustomError(this.language, 'order.error.wrongQRCode');
            }
            await this.orderEditService.editOrder(order, { status: "delivering" });

            // notify client
            await this.clientNotificationService.notifyClient(order.clientId, {
                en: i18n('en', 'order.notification.orderDeliveringTitle'),
                ar: i18n('ar', 'order.notification.orderDeliveringTitle')
            }, {
                en: `${i18n('en', 'order.notification.orderDeliveringBody')}`,
                ar: `${i18n('ar', 'order.notification.orderDeliveringBody')}`,
            }, {
                key: 'orderDelivering',
                value: `${order.id}`
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async listCaptainsInOrderArea(orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const availableCaptains = await this.captainAvailabilityService.getAvailableCaptainsInArea(order.chef.address);
            const firestoreRepositoryHelper = new FirestoreRepositoryHelper();
            const captains = firestoreRepositoryHelper.mapCollection(availableCaptains);
            return captains;
        } catch (error) {
            throw error;
        }
    }

}