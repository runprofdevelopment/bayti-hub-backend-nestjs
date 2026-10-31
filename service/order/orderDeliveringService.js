const admin = require('firebase-admin');
const functions = require("firebase-functions");
const OrderFindService = require('./orderFindService');
const CaptainAvailibilityService = require('../captain/captainAvailibilityService');
const CaptainEditService = require('../captain/captainEditService');
const CaptainNotificationService = require('../captain/captainNotificationService');
const SettingsService = require('../settingsService');
const CustomError = require('../../error/customeError');
const { i18n } = require('../../i18n');
const OrderEditService = require('./orderEditService');

const REGION = 'europe-west1'

module.exports = class OrderDeliveringService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.captainAvailibilityService = new CaptainAvailibilityService(this.currentUser, this.language);
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.settingsService = new SettingsService(this.currentUser, this.language);
        this.orderEditService = new OrderEditService(this.currentUser, this.language);
    }

    async broadcastUnAssignedOrders() {
        try {
            const settings = await this.settingsService.findSettings();
            const deliveryTime = settings.deliveryNotificationTime ? settings.deliveryNotificationTime : 180;

            // get orders with no captain and delivering time less than or equal (required delivery time) minutes
            const leastDate = new Date();
            leastDate.setTime(leastDate.getTime() + (deliveryTime * 60 * 1000));
            const currentDate = new Date();
            const filter = [
                { key: "deliveryTime", value: leastDate, operator: "<=" },
                { key: "captainId", value: null, operator: "==" },
                { key: "status", value: "inProgress", operator: "==" },
                { key: "deliveryTime", value: currentDate, operator: ">" }
            ]
            const orders = await this.orderFindService.listOrders(filter, undefined);

            for (const order of orders) {
                await this.broadcastOrder(order);
            }

        } catch (error) {
            throw error;
        }
    }

    async broadcastOrder(order) {
        try {
            const chefAddress = order.chef.address;
            const visitedCaptains = new Map();
            if (order.captainVisits) {
                for (const visit of order.captainVisits) {
                    visitedCaptains.set(visit.captainId, visit);
                }
            }

            // get available captains to deliver from the ched address
            const availableCaptains = await this.captainAvailibilityService.getAvailableCaptainsInArea(chefAddress);
            for (const captain of availableCaptains) {

                if (visitedCaptains.has(captain.id)) {
                    const visit = visitedCaptains.get(captain.id);
                    if (visit.responded) {
                        continue;
                    }
                    const min = new Date();
                    min.setMinutes(min.getMinutes() - 5);
                    console.log("this is captian check");
                    console.log(min);console.log(visit.time);
                    console.log(min.toISOString() < visit.time);
                    if (min.toISOString() < visit.time) {
                        continue;
                    }
                }

                await this.captainEditService.editCaptain(captain, { pendingOrderId: order.id, pendingOrder: order, pendingOrderTime: (new Date()).toISOString() });
                await this.captainNotificationService.notifyCaptain(captain.id, {
                    en: i18n('en', 'order.notification.captainReceivedOrderTitle'),
                    ar: i18n('ar', 'order.notification.captainReceivedOrderTitle')
                }, {
                    en: `${i18n('en', 'order.notification.captainReceivedOrderBody')} ${order.orderNo}`,
                    ar: `${i18n('ar', 'order.notification.captainReceivedOrderBody')} ${order.orderNo}`,
                }, {
                    key: 'pendingOrder',
                    value: `${order.id}`
                });
                let currentDate = new Date();
                currentDate = currentDate.toISOString();
                visitedCaptains.set(captain.id, { captainId: captain.id, time: currentDate, responded: false });
            }

            if (order.captainVisits) {
                order.captainVisits = [...visitedCaptains.values()];
                await this.orderEditService.editOrder(order, { captainVisits: order.captainVisits });
            }

        } catch (error) {
            throw error;
        }
    }

}