const admin = require('firebase-admin');
const OrderFindService = require('./orderFindService');
const TransactionService = require('../transactionService');
const ClientWalletService = require('../client/clientWalletService');
const OrderEditService = require('./orderEditService');
const ChefFindService = require('../chef/chefFindService');
const ChefWalletService = require('../chef/chefWalletService');
const ChefEditService = require('../chef/chefEditService');
const ClientEditService = require('../client/clientEditService');
const CaptainEditService = require('../captain/captainEditService');
const CaptainWalletService = require('../captain/captainWalletService');
const ChefNotificationService = require('../chef/chefNotificationService');
const ClientNotificationService = require('../client/clientNotificationService');
const VariablesService = require('../variablesService');
const CustomError = require('../../error/customeError');
const { i18n } = require('../../i18n');
const AdminWalletService = require('../admin/adminWalletService');


const REGION = 'europe-west1'

module.exports = class OrderCloseService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.clientWalletService = new ClientWalletService(this.currentUser, this.language);
        this.orderEditService = new OrderEditService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefWalletService = new ChefWalletService(this.currentUser, this.language);
        this.captainWalletService = new CaptainWalletService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
    }

    async closeOrder(order) {
        try {
            const chef = await this.chefFindService.findChefById(order.chefId);
            const promises = [];
            // add amount to chef wallet
            promises.push(this.chefWalletService.addAmountToWallet(order.chefId, order.chefProfit, order.chefProfit));
            promises.push(this.adminWalletService.addAmountToWallet(- order.chefProfit, -order.chefProfit));
            // create transaction for chef
            promises.push(this.transactionService.createTransaction({
                id: admin.firestore().collection(`ids`).doc().id,
                type: 'order',
                amount: order.chefProfit,
                trackId: -1,
                objectType: 'order',
                objectId: order.id,
                objectNo: order.orderNo,
                payerType: 'app',
                payerId: "-1",
                payeeType: 'chef',
                payeeId: order.chefId,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                createdBy: order.clientId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: order.clientId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }));

            if (order.captainId) {
                // add amount to captain wallet
                promises.push(this.captainWalletService.addAmountToWallet(order.captainId, order.captainProfit, order.captainProfit));
                promises.push(this.adminWalletService.addAmountToWallet(- order.captainProfit, -order.captainProfit));
                // create transaction for captain
                promises.push(this.transactionService.createTransaction({
                    id: admin.firestore().collection(`ids`).doc().id,
                    type: 'order',
                    amount: order.captainProfit,
                    trackId: -1,
                    objectType: 'order',
                    objectId: order.id,
                    objectNo: order.orderNo,
                    payerType: 'app',
                    payerId: "-1",
                    payeeType: 'captain',
                    payeeId: order.captainId,
                    status: 'success',
                    paymentMethod: 'wallet',
                    paymentId: -1,
                    createdBy: order.clientId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: order.clientId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }));
            }

            // update order status and make sure no captain assigned
            promises.push(this.orderEditService.editOrder(order, { status: "closed" }));

            // increment cancelledOrdersCount in chef & client and captain
            promises.push(this.clientEditService.editClient(order.client, { closedOrdersCount: admin.firestore.FieldValue.increment(1) }));
            promises.push(this.chefEditService.editChef(order.chef, { closedOrdersCount: admin.firestore.FieldValue.increment(1) }));
            if (order.captain) {
                promises.push(this.captainEditService.editCaptain(order.captain,
                    {
                        closedOrdersCount: admin.firestore.FieldValue.increment(1),
                        pendingOrderId: null,
                        pendingOrder: null,
                        pendingOrderTime: null,
                        deliveringOrderId: null,
                        deliveringOrder: null
                    }));
            }

            // update statistics
            promises.push(this.statsService.incrementVariable("ordersCount"));

            const currentOrdersAmount = await this.statsService.getVariable("ordersAmount");
            promises.push(this.statsService.setVariable("ordersAmount", currentOrdersAmount + order.totalAmount));

            // notification for client
            promises.push(this.clientNotificationService.notifyClient(order.client.id, {
                en: i18n('en', 'order.notification.orderDeliveredClientTile'),
                ar: i18n('ar', 'order.notification.orderDeliveredClientTile')
            }, {
                en: i18n('en', 'order.notification.orderDeliveredClientBody'),
                ar: i18n('ar', 'order.notification.orderDeliveredClientBody'),
            }, {
                key: 'orderDelivered',
                value: `${order.id}`
            }));

            // notification for chef
            promises.push(this.chefNotificationService.notifyChef(order.chef.id, {
                en: i18n('en', 'order.notification.orderDeliveredChefTitle'),
                ar: i18n('ar', 'order.notification.orderDeliveredChefTitle')
            }, {
                en: i18n('en', 'order.notification.orderDeliveredChefBody'),
                ar: i18n('ar', 'order.notification.orderDeliveredChefBody'),
            }, {
                key: 'orderDelivered',
                value: `${order.id}`
            }));

            const lastCheckOrder = await this.orderFindService.findOrderById(order.id);

            if (lastCheckOrder.status !== 'delivering') {
                throw new CustomError(this.language, 'order.error.cannotCloseOrder');
            }

            await Promise.all(promises);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async closeOrderWithInProgressState(orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const status = order.status;

            // TODO in the current state, we can close the order without having captain

            // Order status must be inProgress or delivering
            if (status !== "delivering" && status !== "inProgress") {
                throw new CustomError(this.language, 'order.error.cannotCloseOrder');
            }

            return await this.closeOrder(order);

        } catch (error) {
            throw error;
        }
    }

    async closeOrderWithDeliveringState(orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const status = order.status;

            if (status !== 'delivering') {
                throw new CustomError(this.language, 'order.error.cannotCloseOrder');
            }

            return await this.closeOrder(order);
        } catch (error) {
            throw error;
        }
    }
}