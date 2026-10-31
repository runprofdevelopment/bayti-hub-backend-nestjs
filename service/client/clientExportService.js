const CollectionRepository = require('../../database/collectionRepository');
const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');

module.exports = class ClientExportService {
    constructor(currentUser, language,filter) {
        this.clientRepository = new CollectionRepository("clients");
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
        this.filter=filter??[]
    }

    async exportsToExcel() {
        try {
            let modifiedFilter = [...this.filter]; // Create a copy of the filter array
            if (modifiedFilter.length > 0 && modifiedFilter[0].key==='phoneNumber' && modifiedFilter[0].value[0] !== '+') {
                modifiedFilter[0].value = '+' + modifiedFilter[0].value.substring(1); // Modify the value
            }
            const clients = await this.clientRepository.listDocuments(modifiedFilter, null);

            const columnsHeader = [
                { header: "كود العميل", key: "code" },
                { header: "اسم العميل", key: "fullName" },
                { header: "رقم الهاتف", key: "phoneNumber" },
                { header: "الطلبات المنفذة", key: "closedOrdersCount" },
                { header: "الطلبات الملغية", key: "cancelledOrdersCount" },
                { header: "تاريخ الانضمام", key: "createdAt" },
                { header: "الحالة", key: "isEnabled" },
                { header: "تقييم الكنترول", key: "dashboardReview" },
            ]

            const workBook = await this.excelExporter.export("Clients", columnsHeader, clients);

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
            const clients = await this.clientRepository.listDocuments(filter, null);

            const columnsHeader = [
                { label: "كود العميل", property: "code", width: 50 },
                { label: "اسم العميل", property: "fullName", width: 70 },
                { label: "رقم الهاتف", property: "phoneNumber", width: 70 },
                { label: "الطلبات المنفذة", property: "closedOrdersCount", width: 50 },
                { label: "الطلبات الملغية", property: "cancelledOrdersCount", width: 50 },
                { label: "تاريخ الانضمام", property: "createdAt", width: 100 },
                { label: "الحالة", property: "isEnabled", width: 50 },
                { label: "تقييم الكنترول", property: "dashboardReview", width: 50 },
            ]
            const pdf = await this.pdfExporter.export(columnsHeader, clients);

            return pdf;
        } catch (error) {
            throw error;
        }
    }


}