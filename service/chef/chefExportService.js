const CollectionRepository = require('../../database/collectionRepository');
const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const ChefFindService = require('./chefFindService');

module.exports = class ChefExportService {
    constructor(currentUser, language,filter) {
        this.chefFindService = new ChefFindService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
        this.filter=filter??[]
    }

    async getChefsView() {
        try {
            let modifiedFilter = [...this.filter]; // Create a copy of the filter array
            if (modifiedFilter.length > 0 && modifiedFilter[0].key==='phoneNumber' && modifiedFilter[0].value[0] !== '+') {
                modifiedFilter[0].value = '+' + modifiedFilter[0].value.substring(1); // Modify the value
            }
            const chefs = await this.chefFindService.listChefs(modifiedFilter, null);
            for (const chef of chefs) {
                chef.isKitchenExists = chef.kitchen ? true : false;
                chef.isMealsExists = chef.mealsCount > 0;

                chef.logoFound = chef.kitchen?.logo ? true : false;
                chef.coverFound = chef.kitchen?.cover ? true : false;
                chef.minOrderAmount = chef.kitchen?.minOrderAmount ?? 0;
                chef.kitchenName = chef.kitchen?.kitchenName?.ar ?? "";
                chef.cityName = chef.city?.ar ?? "";

                chef.medicalCertificateFound = chef.medicalCertificate ? true : false;
                chef.freelanceCertificateFound = chef.freelanceCertificate ? true : false;
                chef.idCardFound = chef.idCard ? true : false;
            }

            return chefs;
        } catch (error) {
            throw error;
        }
    }
    async exportsToExcel() {
        try {
            const chefs = await this.getChefsView();

            const columnsHeader = [
                { header: "كود الشيف", key: "code" },
                { header: "الاسم الكامل", key: "fullName" },
                { header: "المطبخ", key: "kitchenName" },
                { header: "المدينة", key: "cityName" },
                { header: "رقم الهاتف", key: "phoneNumber" },
                { header: "الحالة", key: "isEnabled" },
                { header: "تاريخ الانضمام", key: "createdAt" },
                { header: "وجود مطبخ", key: "isKitchenExists" },
                { header: "وجود وجبات", key: "isMealsExists" },
                { header: "شعار المطبخ", key: "logoFound" },
                { header: "غطاء المطبخ", key: "coverFound" },
                { header: "شهادة طبية", key: "medicalCertificateFound" },
                { header: "شهادة العمل الحر", key: "freelanceCertificateFound" },
                { header: "بطاقة التعريف", key: "idCardFound" },
                { header: "الطلبات المنفذة", key: "closedOrdersCount" },
                { header: "الطلبات الملغية", key: "cancelledOrdersCount" },
                { header: "عدد الاقسام", key: "sectionsCount" },
                { header: "عدد الوجبات", key: "mealsCount" },
                { header: "الحد الادني لسعر الطلب", key: "minOrderAmount" },
                { header: "عدد ساعات العمل الاسبوعية", key: "weeklyHours" },
                { header: "التقييم", key: "rating" },
            ]

            const workBook = await this.excelExporter.export("Chefs", columnsHeader, chefs);

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