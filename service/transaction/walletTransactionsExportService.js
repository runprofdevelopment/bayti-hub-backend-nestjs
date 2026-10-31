const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const TransactionService = require('../transactionService');

module.exports = class walletTransactionsExportService {
    constructor(currentUser, language) {
        this.transactionService = new TransactionService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async exportsToExcel(userId) {
        try {
            userId = userId ?? "-1";
            const transactions = await this.transactionService.listWalletTransactionsById(userId, [], null);
            for (const transaction of transactions) {
                transaction.debt = transaction.payerId === userId ? "دائن" : "مدين";
            }

            const columnsHeader = [
                { header: "المبلغ", key: "amount" },
                { header: "نوع المعاملة", key: "objectType" },
                { header: "دائن - مدين", key: "debt" },
                { header: "رقم التتبع", key: "trackId" },
                { header: "ملاحظات", key: "" },
                { header: "الحالة", key: "status" },
                { header: "تاريخ المعاملة", key: "createdAt" },
            ]

            const workBook = await this.excelExporter.export("Transactions", columnsHeader, transactions);

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