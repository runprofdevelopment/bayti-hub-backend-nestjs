const VehicleService = require('../../service/vehicleService')

const sharedResolvers = require('../sharedResolvers')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listVehicles: async (parent, args, context) => {
            const vehicleService = new VehicleService(context.currentUser, context.language);
            return await vehicleService.listVehicles();
        },
        findVehicleById: async (parent, args, context) => {
            const vehicleService = new VehicleService(context.currentUser, context.language);
            return await vehicleService.findVehicleById(args.vehicleId);
        },

    },
    RootMutation: {
        createVehicle: async (root, args, context) => {
            try {
                const vehicleService = new VehicleService(context.currentUser, context.language);
                const vehicle = await vehicleService.createVehicle(args.vehicleInput);
                return {
                    status: true,
                    result: vehicle,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        removeVehicle: async (root, args, context) => {
            try {
                const vehicleService = new VehicleService(context.currentUser, context.language);
                const result = await vehicleService.removeVehicle(args.vehicleId);
                return {
                    status: true,
                    result: result,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
    },
}

module.exports = resolvers