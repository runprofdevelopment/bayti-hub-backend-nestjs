const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const PromotionFindService = require('./promotionFindService');

module.exports = class PromotionsExportService {
    constructor(currentUser, language) {
        this.promotionFindService = new PromotionFindService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async getPromotionsView() {
        try {
            const promotions = await this.promotionFindService.listPromotions([], null);
            console.log(promotions.length);
            for (const promotion of promotions) {
                promotion.code = promotion.chef?.code;
                promotion.fullName = promotion.chef?.fullName;
                promotion.kitchenName = promotion.chef.kitchen?.kitchenName?.ar;

            }
            return promotions;
        } catch (error) {
            throw error;
        }
    }

    async exportsToExcel() {
        try {
            const promotions = await this.getPromotionsView();

            const columnsHeader = [
                { header: "كود الشيف", key: "code" },
                { header: "اسم الشيف", key: "fullName" },
                { header: "اسم المطبخ", key: "kitchenName" },
                { header: "تاريخ البداية", key: "startDate" },
                { header: "تاريخ النهاية", key: "endDate" },
                { header: "عدد الايام", key: "daysCount" },
                { header: "السعر", key: "amount" },
                { header: "أنشئت في", key: "createdAt" },
            ]

            const workBook = await this.excelExporter.export("promotions", columnsHeader, promotions);

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