const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const AdminFindService = require('./adminFindService');

module.exports = class AdminExportService {
    constructor(currentUser, language) {
        this.adminFindService = new AdminFindService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
    }

    async exportsToExcel() {
        try {
            const admins = await this.adminFindService.listAdmins([], null);

            const columnsHeader = [
                { header: "اسم المستخدم", key: "userName" },
                { header: "رقم الهاتف", key: "phoneNumber" },
                { header: "البريد الالكتروني", key: "email" },
                { header: "الصلاحية", key: "role" },
                { header: "تاريخ الانضمام", key: "createdAt" },
                { header: "الحالة", key: "isEnabled" },
            ]

            const workBook = await this.excelExporter.export("Admins", columnsHeader, admins);

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
            const admins = await this.adminRepository.listDocuments(filter, null);

            const columnsHeader = [
                { label: "اسم المستخدم", property: "userName", width: 50 },
                { label: "رقم الهاتف", property: "phoneNumber", width: 70 },
                { label: "البريد الالكتروني", property: "email", width: 70 },
                { label: "الصلاحية", property: "role", width: 50 },
                { label: "تاريخ الانضمام", property: "createdAt", width: 100 },
                { label: "الحالة", property: "isEnabled", width: 50 },
            ]
            const pdf = await this.pdfExporter.export(columnsHeader, admins);

            return pdf;
        } catch (error) {
            throw error;
        }
    }


}