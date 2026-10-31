const admin = require('firebase-admin');
const { i18n } = require('../../i18n');
const CustomError = require('../../error/customeError');
const OrderFindService = require('./orderFindService');
const ChefNotificationService = require('../chef/chefNotificationService');
const VariablesService = require("../variablesService");

const REGION = 'europe-west1'

module.exports = class OrderReminderService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "variables");
    }

    async remindOrders() {
        try {
            const reminderTimes = [
                (3 * 24 * 60),
                (2 * 24 * 60),
                24 * 60,
                12 * 60,
                9 * 60,
                3 * 60,
                60
            ];

            const promises = reminderTimes.map(reminderTime => this.reminOrdersInTimeFrame(reminderTime));
            await Promise.all(promises);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async reminOrdersInTimeFrame(remainingMinutes) {
        try {
            const deliveryTime = await this.variablesService.getVariable("deliveryTime");

            const leastDate = new Date();
            leastDate.setTime(leastDate.getTime() + (deliveryTime * 60 * 1000));

            const min = new Date();
            min.setSeconds(0);
            min.setMilliseconds(0);
            min.setTime(min.getTime() + (deliveryTime + remainingMinutes - 1) * 60 * 1000);

            const max = new Date();
            max.setSeconds(0)
            max.setMilliseconds(0)
            max.setTime(max.getTime() + (deliveryTime + remainingMinutes) * 60 * 1000);

            const filter = [
                { key: "status", operator: "==", value: "inProgress" },
                { key: "deliveryTime", operator: ">=", value: min },
                { key: "deliveryTime", operator: "<=", value: max },
            ]
            const orders = await this.orderFindService.listOrders(filter, undefined);

            const notifies = [];
            for (const order of orders) {
                notifies.push(this.chefNotificationService.notifyChef(
                    order.chef.id, {
                    en: i18n('en', 'order.notification.orderReminderTitle'),
                    ar: i18n('ar', 'order.notification.orderReminderTitle')
                }, {
                    en: `${i18n('en', 'order.notification.orderReminderBody')}`,
                    ar: `${i18n('ar', 'order.notification.orderReminderBody')}`,
                }, {
                    key: 'orderReminder',
                    value: `${order.id}`
                }
                ))
            }

            await Promise.all(notifies);

            return true;
        } catch (error) {
            throw error;
        }
    }
}