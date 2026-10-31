const CollectionRepository = require('../../database/collectionRepository');
const ExcelExporter = require('../shared/excelExporter');
const PDFExporter = require('../shared/pdfExporter');
const CaptainFindService = require('./captainFindService');

module.exports = class CaptainExportService {
    constructor(currentUser, language,filter) {
        this.captainFindService = new CaptainFindService(currentUser, language);
        this.excelExporter = new ExcelExporter();
        this.pdfExporter = new PDFExporter();
        this.filter=filter??[]

    }

    async getCaptainsView() {
        try {
            let modifiedFilter = [...this.filter]; // Create a copy of the filter array
            if (modifiedFilter.length > 0 && modifiedFilter[0].key==='phoneNumber' && modifiedFilter[0].value[0] !== '+') {
                modifiedFilter[0].value = '+' + modifiedFilter[0].value.substring(1); // Modify the value
            }
            const captains = await this.captainFindService.listCaptains(modifiedFilter, null);
            console.log(captains.length);
            for (const captain of captains) {
                if (captain.city) {
                    captain.cityName = captain.city.ar;
                }
                captain.licenseFound = captain.license ? true : false;
                captain.vehicleLicenseFound = captain.vehicleLicense ? true : false;
                captain.idCardFound = captain.idCard ? true : false;
                captain.carType = captain.vehicle?.name?.ar;
            }

            return captains;
        } catch (error) {
            throw error;
        }
    }

    async exportsToExcel() {
        try {
          
            const captains = await this.getCaptainsView();
           

            const columnsHeader = [
                { header: "كود الكابتن", key: "code" },
                { header: "الاسم الكامل", key: "fullName" },
                { header: "المدينة", key: "cityName" },
                { header: "الطلبات المنفذة", key: "closedOrdersCount" },
                { header: "الطلبات الملغية", key: "cancelledOrdersCount" },
                { header: "تاريخ الانضمام", key: "createdAt" },
                { header: "رقم الهاتف", key: "phoneNumber" },
                { header: "الحالة", key: "isEnabled" },
                { header: "رخصة", key: "licenseFound" },
                { header: "ترخيص السيارة", key: "vehicleLicenseFound" },
                { header: "المركبة", key: "carType" },
            ]

            const workBook = await this.excelExporter.export("Captains", columnsHeader, captains);

            return workBook;
        } catch (error) {
            throw error;
        }
    }

    async exportsToPDF() {
        try {
            const captains = await this.getCaptainsView();

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
            ];
            const pdf = await this.pdfExporter.export(columnsHeader, captains);

            return pdf;
        } catch (error) {
            throw error;
        }
    }

}