const sharedResolvers = require('../sharedResolvers')
const TransactionService = require('../../service/transactionService')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listWalletTransactions: async (parent, args, context) => {
            try {
                const walletId = args.walletId
                const filter = args.filter
                const pagination = args.pagination
                const transactionService = new TransactionService(context.user, context.currentUser, context.language)
                const transactions = await transactionService.listWalletTransactionsById(walletId, filter, pagination)

                return transactions;
            } catch (error) {
                throw error
            }
        },
    },
    RootMutation: {
        temp: async (root, args, context) => {
            return {}
        }
    },


}

module.exports = resolvers