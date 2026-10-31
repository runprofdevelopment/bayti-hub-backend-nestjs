const FirebaseHelper = require('../../database/utils-v2/firebaseHelper');
const OrderFindService = require('../order/orderFindService');

module.exports = class ClientWalletListing {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
    }

    _initializeFilter(filters) {
        filters = filters || [];

        filters = filters.map(filter => { 
            return { 
                field: filter.key, 
                operator: filter.operator, 
                value: `${filter.value}`,
            } 
        });

        filters.push({ field: 'clientId', operator: 'notEqual', value: '' });
        return filters;
    }

    async listWalletsGroup(filter, pagination) {
        try {
            filter = this._initializeFilter(filter);
            const orderBy = pagination.orderBy;
            pagination = {
                // page: Number,
                offset: pagination.offset || 0,
                limit: pagination.limit,
                sortBy: pagination.sortType,
                action: pagination.action,
                doc: pagination.doc,
            }

            const FirestoreRepositroyHelper = require('../../database/helper/firestoreRepositoryHelper');
            const response = await new FirestoreRepositroyHelper().listCollectionGroup('wallets', {
                filter,
                orderBy,
                pagination
            });

            const wallets = response.rows;
            const clientsWallets = await Promise.all(
                wallets.map(wallet => this.populate(wallet)),
            );

            return clientsWallets;
        } catch (error) {
            throw error;
        }
    }

    async populate(record) {
        if (!record) {
            return record;
        }

        const client = await FirebaseHelper.findRelation('clients', record.clientId);
        record['client'] = client;

        const now = new Date();

        // Start of the day
        const startOfToday = new Date();
        startOfToday.setHours(0); startOfToday.setMinutes(0); startOfToday.setSeconds(0);

        // Start of the week
        const startOfWeek = new Date();
        const weekDay = (startOfWeek.getDay() + 1) % 7;
        startOfWeek.setDate(startOfWeek.getDate() - weekDay);
        startOfWeek.setHours(0); startOfWeek.setMinutes(0); startOfWeek.setSeconds(0);

        // Start of the month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0); startOfMonth.setMinutes(0); startOfMonth.setSeconds(0);
        // Start of the year
        const startOfYear = new Date();
        startOfYear.setFullYear(startOfYear.getFullYear() - 100);
        // Get today amount
        const todayAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfToday, now);
        record['dayAmount'] = todayAmounts.clientAmount;

        // Get week amount
        const weekAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfWeek, now);
        record['weekAmount'] = weekAmounts.clientAmount;

        // Get month amount
        const monthAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfMonth, now);
        record['monthAmount'] = monthAmounts.clientAmount;
        // Get year amount
        const yearAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfYear, now);
        record['yearAmount'] = yearAmounts.clientAmount;

        return record;
    }
}