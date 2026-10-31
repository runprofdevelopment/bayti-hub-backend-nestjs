const sharedResolvers = require('../sharedResolvers')
const RequestService = require('../../service/requestService')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        userRequests: async (parent, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'user', '')
                const requestService = new RequestService(context.user, context.currentUser, context.language)
                const requests = await requestService.getRequestsForUser(args.pagination)

                return requests
            } catch (error) {
                throw error
            }
        },
        listRequests: async (parent, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'admin', 'viewRequests')
                const filter = args.filter
                const pagination = args.pagination

                const requestService = new RequestService(context.user, context.currentUser, context.language)
                const requests = await requestService.getRequests(filter, pagination)

                return requests
            } catch (error) {
                throw error
            }
        },
    },
    RootMutation: {
        addWithdrawRequest: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'user', '')
                const requestService = new RequestService(context.user, context.currentUser, context.language)

                const data = args.requestInput
                const request = await requestService.addWithdrawRequest(data)

                return {
                    status: true,
                    result: request,
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
        decideWithdrawRequest: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'admin', 'takeRequestAction')
                const requestService = new RequestService(context.user, context.currentUser, context.language)

                const requestId = args.requestId
                const acceptRequest = args.acceptRequest
                const transactionTimeStamp = args.transactionTimeStamp
                const notes = args.notes
                const request = await requestService.decideWithdrawRequest(requestId, acceptRequest, transactionTimeStamp, notes)

                return {
                    status: true,
                    result: request,
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
        confirmWithdrawRequest: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'admin', 'takeRequestAction')
                const requestService = new RequestService(context.user, context.currentUser, context.language)

                const requestId = args.requestId
                const transactionId = args.transactionId
                const transactionUrl = args.transactionUrl
                const request = await requestService.confirmWithdrawRequest
                    (requestId, transactionId, transactionUrl)

                return {
                    status: true,
                    result: request,
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
    }

}

module.exports = resolvers