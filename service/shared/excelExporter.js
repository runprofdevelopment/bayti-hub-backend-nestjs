const ExcelJS = require("exceljs");
module.exports = class ExcelExporter {

    constructor() {

    }

    async export(sheetName, columnsHeader, records) {
        try {
            const workbook = new ExcelJS.Workbook();              // Create a new workbook
            const worksheet = workbook.addWorksheet(`${sheetName}`);  // New Worksheet

            const shared_style = {
                font: { size: 14 },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            }

            // Column for data in excel. key must match data key
            const columns = [];
            for (const header of columnsHeader) {
                columns.push({ header: header.header, key: header.key, width: 15, style: shared_style });
            }
            worksheet.columns = columns;


            // Looping through records data
            records.forEach((record) => {
                worksheet.addRow(record);
            });

            // Making first line in excel bold
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, size: 15, color: { argb: '00000000' }, };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ececec' } };
            });

            return workbook;
        } catch (error) {
            throw error;
        }
    }
}