const PDFDocument = require("pdfkit-table");
const XMLHttpRequest = require('xhr2');
const PdfTable = require("voilab-pdf-table");
const fetch = require("node-fetch");

module.exports = class PDFExporter {

    async export(columnsHeader, records) {
        try {
            // const font = await fetch('/static/fonts/Arabic-webfont.woff')
            // const arrayBuffer = await font.arrayBuffer()

            // doc.registerFont('arabic', arrayBuffer)

            // var xhr = new XMLHttpRequest();
            // xhr.open('GET', `/static/fonts/Arabic-webfont.woff`, true);
            // xhr.responseType = 'arraybuffer';

            const font = await fetch('./arabic.ttf');
            const arrayBuffer = await font.arrayBuffer();
            pdf.registerFont('arabic', arrayBuffer);
            pdf.font('arabic').text('مينا سمير');

            const pdf = new PDFDocument({
                margin: 30,
                size: 'A4'
            });
            // pdf.rtl(true);
            pdf.fontSize(8);

            pdf.font("arabic");

            // xhr.onload = function (e) { 
            //     if (this.status == 200) {
            //         console.log("returned");
            //         pdf.registerFont('arabic', xhr.response);
            //         pdf.font("arabic");
            //     }
            // }



            // const table = new PdfTable(pdf, {
            //     bottomMargin: 30
            // });

            // table
            //     .setColumnsDefaults({
            //         headerBorder: 'B',
            //         align: 'right',

            //     }).addColumns(columnsHeader)
            //     .onPageAdded(function (tb) {
            //         tb.addHeader();
            //     });

            const table = {
                title: "Clients",
                headers: columnsHeader,
                datas: records
            }
            await pdf.table(table);


            return pdf;
        } catch (error) {
            throw error;
        }
    }
}