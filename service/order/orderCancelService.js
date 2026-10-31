const admin = require('firebase-admin');
const functions = require("firebase-functions");
const { i18n } = require('../../i18n');
const OrderFindService = require('./orderFindService');
const TransactionService = require('../transactionService');
const ClientWalletService = require('../client/clientWalletService');
const OrderEditService = require('./orderEditService');
const ClientEditService = require('../client/clientEditService');
const ChefEditService = require('../chef/chefEditService');
const CaptainEditService = require('../captain/captainEditService');
const ChefNotificationService = require('../chef/chefNotificationService');
const ClientNotificationService = require('../client/clientNotificationService');
const CustomError = require('../../error/customeError');

const REGION = 'europe-west1';

module.exports = class OrderCancelService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.clientWalletService = new ClientWalletService(this.currentUser, this.language);
        this.orderEditService = new OrderEditService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
    }

    async cancelOrder(orderId, notes) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const status = order.status;

            if (status !== 'inProgress' && status !== 'delivering') {
                throw new CustomError(this.language, 'order.error.cannotCancelOrder');
            }

            // refund money to the client wallet
            await this.clientWalletService.addAmountToWallet(order.clientId, order.totalAmount, order.totalAmount);

            // Create transaction for the refund
            const transaction = await this.transactionService.createTransaction({
                id: await admin.firestore().collection(`ids`).doc().id,
                type: 'refund',
                amount: order.totalAmount,
                trackId: -1,
                objectType: 'order',
                objectId: orderId,
                payerType: 'app',
                payerId: -1,
                payeeType: 'client',
                payeeId: order.clientId,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                createdBy: order.clientId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: order.clientId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // update order status and make sure no captain assigned
            await this.orderEditService.editOrder(order, { status: "cancelled", captainId: null, captain: null, notes });


            // increment cancelledOrdersCount in chef & client and captain
            await this.clientEditService.editClient(order.client, {cancelledOrdersCount: admin.firestore.FieldValue.increment(1)});
            await this.chefEditService.editChef(order.chef, {cancelledOrdersCount: admin.firestore.FieldValue.increment(1)});
            if(order.captain){
                await this.captainEditService.editCaptain(order.captain, 
                    {
                        cancelledOrdersCount: admin.firestore.FieldValue.increment(1),  
                        pendingOrderId: null,
                        pendingOrder: null,
                        pendingOrderTime: null,
                        deliveringOrderId: null,
                        deliveringOrder: null
                });
            }

             // notification for client
             await this.clientNotificationService.notifyClient(order.client.id, {
                en: i18n('en', 'order.notification.orderCanceledTitle'),
                ar: i18n('ar', 'order.notification.orderCanceledTitle')
            }, {
                en: i18n('en', 'order.notification.orderCanceledBody'),
                ar: i18n('ar', 'order.notification.orderCanceledBody'),
            }, {
                key: 'orderCanceled',
                value: `${orderId}`
            });

            // notification for chef
            await this.chefNotificationService.notifyChef(order.chef.id, {
                en: i18n('en', 'order.notification.orderCanceledTitle'),
                ar: i18n('ar', 'order.notification.orderCanceledTitle')
            }, {
                en: i18n('en', 'order.notification.orderCanceledBody'),
                ar: i18n('ar', 'order.notification.orderCanceledBody'),
            }, {
                key: 'orderCanceled',
                value: `${orderId}`
            });

            return true;
        } catch (error) {
            throw error;
        }
    }
}