const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const CitiesReportService = require('./citiesReport');

module.exports = class CitiesReportExportService {
    constructor(currentUser, language) {
        this.citiesReportService = new CitiesReportService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async exportsToExcel(userId, startDate, endDate) {
        try {
            startDate = startDate ?? new Date();
            endDate = endDate ?? new Date();

            const citiesReport = await this.citiesReportService.getCitiesReport(startDate, endDate);
            for (const cityReport of citiesReport) {
                cityReport.cityName = cityReport.city?.ar;
            }

            const columnsHeader = [
                { header: "المدينة", key: "cityName" },
                { header: "عدد الطلبات", key: "ordersCount" },
                { header: "ربح الشيفات", key: "chefsProfit" },
                { header: "ربح الكباتن", key: "captainsProfit" },
                { header: "ربح التطبيق", key: "appProfit" },
            ]

            const workBook = await this.excelExporter.export("Cities Report", columnsHeader, citiesReport);

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