const admin = require('firebase-admin');
const OrderFindService = require('../order/orderFindService');
const CityService = require('../cityService');

module.exports = class CitiesReportService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.cityService = new CityService(this.currentUser, this.language);
    }

    async getCitiesReport(startDate, endDate) {
        try {
            const cities = await this.cityService.listCities();
            const citiesMap = new Map();
            for (const city of cities) {
                citiesMap.set(city.id, {
                    cityId: city.id,
                    city,
                    ordersCount: 0,
                    chefsProfit: 0,
                    captainsProfit: 0,
                    appProfit: 0
                })
            }

            const filter = [
                { key: "deliveryTime", value: startDate, operator: ">=" },
                { key: "deliveryTime", value: endDate, operator: "<=" },
                { key: "status", value: "closed", operator: "==" }
            ]
            const orders = await this.orderFindService.listOrders(filter, undefined);

            for (const order of orders) {
                const cityId = order.cityId;
                if (cityId && citiesMap.has(cityId)) {
                    const cityReport = citiesMap.get(cityId);
                    cityReport.ordersCount = cityReport.ordersCount + 1;
                    cityReport.chefsProfit = cityReport.chefsProfit + order.chefProfit;
                    cityReport.captainsProfit = cityReport.captainsProfit + order.captainProfit;
                    cityReport.appProfit = cityReport.appProfit + order.appTotalProfit;
                }
            }

            const reports = [];
            for (const city of cities) {
                reports.push(citiesMap.get(city.id));
            }
            reports.sort((a, b) => b.ordersCount - a.ordersCount);
            return reports;
        } catch (error) {
            throw error
        }
    }


}