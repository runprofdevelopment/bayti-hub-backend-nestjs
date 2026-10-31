const express = require('express');
const cors = require('cors');
const authMiddleware = require('../../auth/authMiddleware');
const ExporterFactory = require('../../service/shared/exporterFactory');

const app = express();
app.use(cors({ origin: true }));

app.get('', async(request, res) => {
    const resource = request.query.resource;
    const userId = request.query.userId;
    const startDate = request.query.startDate;
    const endDate = request.query.endDate;
    const filter=request.query.filter? JSON.parse(request.query.filter):[]
    if (!resource) {
        res.status(404);
    } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + `${resource}.xlsx`);
        
        const exportService = ExporterFactory.getExporter(resource,filter??[]);
        const workBook = await exportService.exportsToExcel(userId, startDate, endDate);
        const buffer = await workBook.xlsx.writeBuffer(res);
        res.send(buffer);
        res.status(200);
    }
});

module.exports = app