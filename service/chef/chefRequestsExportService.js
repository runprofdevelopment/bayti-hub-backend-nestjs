const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const ChefRequestService = require('./chefRequestService');

module.exports = class ChefRequestsExportService {
    constructor(currentUser, language) {
        this.chefRequestService = new ChefRequestService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async exportsToExcel() {
        try {
            const requests = await this.chefRequestService.listChefRequests([], null);
            for (const request of requests) {
                request.code = request.chef?.code;
                request.fullName = request.chef?.fullName;
                request.bankName = request.bankAccount?.bankName;
                request.iban = request.bankAccount?.iban;
            }

            const columnsHeader = [
                { header: "الكود", key: "code" },
                { header: "الاسم الرباعي", key: "fullName" },
                { header: "المبلغ", key: "amount" },
                { header: "نوع الطلب", key: "type" },
                { header: "اسم البنك", key: "bankName" },
                { header: "آيبان", key: "iban" },
                { header: "حالة الطلب", key: "status" },
                { header: "تاريخ الاستحقاق", key: "transactionTimeStamp" },
                { header: "تاريخ الطلب", key: "createdAt" }
            ]

            const workBook = await this.excelExporter.export("Chef Requests", columnsHeader, requests);

            return workBook;
        } catch (error) {
            throw error;
        }
    }

    async exportsToPDF() {
        try {
            const chefs = await this.getChefsView();

            const columnsHeader = [
                { label: "كود الشيف", property: "code", width: 50 },
                { label: "الاسم الكامل", property: "fullName", width: 50 },
                { label: "المطبخ", property: "kitchen.kitchenName.ar", width: 50 },
                { label: "المدينة", property: "city.ar", width: 50 },
                { label: "الطلبات المنفذة", property: "closedOrdersCount", width: 50 },
                { label: "الطلبات الملغية", property: "cancelledOrdersCount", width: 50 },
                { label: "شهادة طبية", property: "medicalCertificate", width: 50 },
                { label: "شهادة العمل الحر", property: "freelanceCertificate", width: 50 },
                { label: "بطاقة التعريف", property: "idCard", width: 50 },
                { label: "شعار المطبخ", property: "kitchen.logo", width: 50 },
                { label: "غطاء المطبخ", property: "kitchen.cover", width: 50 },
                { label: "التقييم", property: "rating", width: 50 },
                { label: "تاريخ الانضمام", property: "createdAt", width: 50 },
                { label: "رقم الهاتف", property: "phoneNumber", width: 50 },
                { label: "الحالة", property: "isEnabled", width: 50 },
                { label: "الحد الادني لسعر الطلب", property: "kitchen.minOrderAmount", width: 50 },
            ]
            const pdf = await this.pdfExporter.export(columnsHeader, chefs);

            return pdf;
        } catch (error) {
            throw error;
        }
    }


}