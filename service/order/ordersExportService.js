const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const OrderFindService = require('./orderFindService');

module.exports = class OrdersExportService {
    constructor(currentUser, language) {
        this.orderFindService = new OrderFindService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async getOrdersView() {
        try {
            const orders = await this.orderFindService.listOrders([], null);
            for (const order of orders) {
                order.chefCode = order.chef?.code;
                order.clientCode = order.client?.code;
                order.captainCode = order.captain?.code;
                order.kitchenName = order.chef?.kitchen?.kitchenName?.ar;

            }
            return orders;
        } catch (error) {
            throw error;
        }
    }

    async exportsToExcel() {
        try {
            const orders = await this.getOrdersView();

            const columnsHeader = [
                { header: "رقم الطلب", key: "orderNo" },
                { header: "كود الشيف", key: "chefCode" },
                { header: "كود العميل", key: "clientCode" },
                { header: "كود الكابتن", key: "captainCode" },
                { header: "المبلغ الاجمالي", key: "totalAmount" },
                { header: "طريقة الدفع", key: "paymentMethod" },
                { header: "حالة الطلب", key: "status" },
                { header: "تاريخ الطلب", key: "createdAt" },
                { header: "موعد التسليم", key: "pickUpTime" },
                { header: "موعد التوصيل", key: "deliveryTime" },
            ]

            const workBook = await this.excelExporter.export("orders", columnsHeader, orders);

            return workBook;
        } catch (error) {
            throw error;
        }
    }

    async exportsToPDF() {
        try {
            const filter = [
                { key: 'isRemoved', operator: '==', value: false },
            ]
            const promotions = await this.promotionsRepository.listDocuments(filter, null);

            const columnsHeader = [
                { label: "كود الكابتن", property: "code", width: 50 },
                { label: "الاسم الكامل", property: "fullName", width: 50 },
                { label: "المدينة", property: "city.ar", width: 50 },
                { label: "الطلبات المنفذة", property: "closedOrdersCount", width: 50 },
                { label: "الطلبات الملغية", property: "cancelledOrdersCount", width: 50 },
                { label: "تاريخ الانضمام", property: "createdAt", width: 50 },
                { label: "رقم الهاتف", property: "phoneNumber", width: 50 },
                { label: "الحالة", property: "isEnabled", width: 50 },
                { label: "رخصة", property: "license", width: 50 },
                { label: "ترخيص السيارة", property: "vehicleLicense", width: 50 },
                { label: "المركبة", property: "vehicle.name.ar", width: 50 },
            ]
            const pdf = await this.pdfExporter.export(columnsHeader, captains);

            return pdf;
        } catch (error) {
            throw error;
        }
    }


}