const ClientExportService = require("../client/clientExportService");
const ChefExportService = require("../chef/chefExportService");
const CaptainExportService = require("../captain/captainExportService");
const AdminExportService = require("../admin/adminExportService");
const PromotionsExportService = require("../promotion/promotionsExportService");
const OrdersExportService = require("../order/ordersExportService");
const CitiesReportExportService = require("../report/citiesReportExportService");
const SalesReportExportService = require("../report/salesReportExportService");
const ChefRequestsExportService = require("../chef/chefRequestsExportService");
const CaptainRequestsExportService = require("../captain/chefRequestsExportService");
const walletTransactionsExportService = require("../transaction/walletTransactionsExportService");

module.exports = class ExporterFactory {

    static getExporter(type,filter) {
        try {
            switch (type) {
                case "client": return new ClientExportService(null, "ar",filter);
                case "chef": return new ChefExportService(null, "ar",filter);
                case "captain": return new CaptainExportService(null, "ar",filter);
                case "admin": return new AdminExportService(null, "ar");
                case "promotion": return new PromotionsExportService(null, "ar");
                case "report-city": return new CitiesReportExportService(null, "ar");
                case "report-sales": return new SalesReportExportService(null, "ar"); 
                case "requests-chefs": return new ChefRequestsExportService(null, "ar");
                case "requests-captains": return new CaptainRequestsExportService(null, "ar");
                case "wallet-app": return new walletTransactionsExportService(null, "ar");
                case "wallet-client": return new walletTransactionsExportService(null, "ar");
                case "wallet-chef": return new walletTransactionsExportService(null, "ar");
                case "wallet-captain": return new walletTransactionsExportService(null, "ar");
                case "order": return new OrdersExportService(null, "ar");
            }

            return null;
        } catch (error) {
            throw error;
        }
    }
}