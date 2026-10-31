const admin = require('firebase-admin');
const OrderFindService = require('../order/orderFindService');
const ValidateService = require('../validateService');

module.exports = class SalesReportService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
    }

    async getSalesReport(startDate, endDate) {
        try {
            const filter = [
                { key: "deliveryTime", value: startDate, operator: ">=" },
                { key: "deliveryTime", value: endDate, operator: "<=" },
                { key: "status", value: "closed", operator: "==" }
            ]

            const orders = await this.orderFindService.listOrders(filter, undefined);
            let total = 0, taxes = 0, chefsPayment = 0, captainsPayment = 0, profit = 0;
            for(const order of orders){
                total += order.totalAmount;
                chefsPayment += order.chefProfit;
                captainsPayment += order.captainProfit;
                profit += order.appTotalProfit;
                if(order.taxes){
                    taxes += order.taxes;
                }
            }

            total = ValidateService.roundFloat(total);
            chefsPayment = ValidateService.roundFloat(chefsPayment);
            captainsPayment =  ValidateService.roundFloat(captainsPayment);
            profit = ValidateService.roundFloat(profit);

            const salesReport = {
                total,
                taxes,
                chefsPayment,
                captainsPayment,
                profit,
            }

            return salesReport;
        } catch (error) {
            throw error;
        }
    }
   
}