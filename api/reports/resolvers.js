const CitiesReport = require('../../service/report/citiesReport');
const SalesReport = require('../../service/report/salesReport');
const sharedResolvers = require('../sharedResolvers');
const PermissionService = require('../../service/permissionService');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        getSalesReport: async (parent, args, context) => {
            const startDate = args.startDate
            const endDate = args.endDate
            const salesReport = new SalesReport(context.currentUser, context.language);
            const report = await salesReport.getSalesReport(startDate, endDate);

            return report
        },
        getCitiesReport: async (parent, args, context) => {
            const startDate = args.startDate
            const endDate = args.endDate
            const citiesReport = new CitiesReport(context.currentUser, context.language);
            const report = await citiesReport.getCitiesReport(startDate, endDate);

            return report
        },

    },
    RootMutation: {

    }
}

module.exports = resolvers