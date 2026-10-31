const admin = require('firebase-admin');
const AlRajhiBankGateway = require('./shared/payment-gateway/alRajhiBank');
const ClientWalletService = require('./client/clientWalletService');
const ChefWalletService = require('./chef/chefWalletService');
const CaptainWalletService = require('./captain/captainWalletService');
const TransactionService = require('./transactionService');
const CheckoutService = require('./order/checkoutService');
const PromotionCreateService = require('./promotion/promotionCreateService');
const AdminWalletService = require('./admin/adminWalletService');

module.exports = class paymentWebHook {

    async handlePayment(processType, trandata) {
        try {
            let response = { action: 'send', result: `Nothing process` }
            switch (processType) {
                case 'wallet-charging-client':
                    return await this.walletCharging(trandata, 'client');
                case 'wallet-charging-chef':
                    return await this.walletCharging(trandata, 'chef');
                case 'wallet-charging-captain':
                    return await this.walletCharging(trandata, 'captain');
                case 'wallet-charging-app':
                        return await this.walletCharging(trandata, 'app');
                case 'checkout':
                    return await this.checkout(trandata);
                case 'promotion':
                    return await this.promotion(trandata);
            }
            return response
        } catch (error) {
            throw error
        }
    }

    async walletCharging(trandata, userType) {
        try {
            if (!trandata) {
                throw {
                    code: 'NOT_FOUND',
                    message: `trandata is required`
                }
            }
            const RajhiBankGateway = new AlRajhiBankGateway()
            const decryptedText = RajhiBankGateway.decryptData(trandata)
            const decryptedTrandata = decodeURIComponent(decryptedText)
            const result = decryptedTrandata.substring(1, decryptedTrandata.length - 1);
            const BANK_TRANSACTION = JSON.parse(result)
            const trackId = BANK_TRANSACTION.trackId
            const transId = BANK_TRANSACTION.transId

            if (transId) {
                // Sccuessful charging
                // Update transaction to success
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)
                const amount = parseFloat(BANK_TRANSACTION.amt)
                const walletId = transactions.length ? transactions[0].objectId : null

                transactions.forEach(async (transaction) => {
                    transaction['transId'] = transId
                    transaction['status'] = 'success'
                    transaction['updatedBy'] = walletId
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()
                    await transactionService.updateTransaction(transaction.id, transaction)
                })

                // Update wallet amount
                switch (userType) {
                    case 'client':
                        const clientWalletService = new ClientWalletService();
                        await clientWalletService.addAmountToWallet(walletId, amount, amount);
                        break
                    case 'chef':
                        const chefWalletService = new ChefWalletService();
                        await chefWalletService.addAmountToWallet(walletId, amount, amount);
                        break
                    case 'captain':
                        const captainWalletService = new CaptainWalletService();
                        await captainWalletService.addAmountToWallet(walletId, amount, amount);
                        break;
                    case 'app':
                        const adminWalletService = new AdminWalletService();
                        await adminWalletService.addAmountToWallet(amount, amount);
                        break;
                }

                return { action: 'send', result: `Wallet is charged successfully.` }
            } else {
                // Failed charging
                // Update transaction to failed
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)
                const walletId = transactions.length ? transactions[0].objectId : null

                transactions.forEach(async (transaction) => {
                    transaction['status'] = 'fail'
                    transaction['updatedBy'] = walletId
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()

                    await transactionService.updateTransaction(transaction.id, transaction)
                })
                return { action: 'send', result: `Failed to recharge Wallet.` }
            }
        } catch (error) {
            throw error
        }
    }

    async checkout(trandata) {
        try {
            if (!trandata) {
                throw {
                    code: 'NOT_FOUND',
                    message: `trandata is required`
                }
            }
            const RajhiBankGateway = new AlRajhiBankGateway()
            const decryptedText = RajhiBankGateway.decryptData(trandata)
            const decryptedTrandata = decodeURIComponent(decryptedText)
            const result = decryptedTrandata.substring(1, decryptedTrandata.length - 1);
            const BANK_TRANSACTION = JSON.parse(result)
            const trackId = BANK_TRANSACTION.trackId
            const transId = BANK_TRANSACTION.transId

            if (transId) {
                // Sccuessful checkout
                // Update transaction to success
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)
                const orderId = transactions.length ? transactions[0].objectId : null

                // update orders status
                const checkoutService = new CheckoutService()
                await checkoutService.successOrderPayment(orderId);

                transactions.forEach(async (transaction) => {
                    transaction['transId'] = transId
                    transaction['status'] = 'success'
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()
                    await transactionService.updateTransaction(transaction.id, transaction)


                })
                return { action: 'send', result: `Order completed successfully.` }
            } else {
                // Failed charging
                // Update transaction to failed
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)

                transactions.forEach(async (transaction) => {
                    transaction['status'] = 'fail'
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()

                    await transactionService.updateTransaction(transaction.id, transaction)
                })
                return { action: 'send', result: `Failed to create order.` }
            }
        } catch (error) {
            throw error
        }
    }

    async promotion(trandata) {
        try {
            if (!trandata) {
                throw {
                    code: 'NOT_FOUND',
                    message: `trandata is required`
                }
            }
            const RajhiBankGateway = new AlRajhiBankGateway()
            const decryptedText = RajhiBankGateway.decryptData(trandata)
            const decryptedTrandata = decodeURIComponent(decryptedText)
            const result = decryptedTrandata.substring(1, decryptedTrandata.length - 1);
            const BANK_TRANSACTION = JSON.parse(result)
            const trackId = BANK_TRANSACTION.trackId
            const transId = BANK_TRANSACTION.transId

            if (transId) {
                // Sccuessful promotion
                // Update transaction to success
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)
                const promotionId = transactions.length ? transactions[0].objectId : null

                // update orders status
                const promotionCreateService = new PromotionCreateService();
                await promotionCreateService.successPromotionPayment(promotionId);

                transactions.forEach(async (transaction) => {
                    transaction['transId'] = transId
                    transaction['status'] = 'success'
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()
                    await transactionService.updateTransaction(transaction.id, transaction)


                })
                return { action: 'send', result: `Order completed successfully.` }
            } else {
                // Failed charging
                // Update transaction to failed
                const transactionService = new TransactionService()
                const transactions = await transactionService.getTransactionsByTrackId(trackId)

                transactions.forEach(async (transaction) => {
                    transaction['status'] = 'fail'
                    transaction['updatedAt'] = admin.firestore.FieldValue.serverTimestamp()

                    await transactionService.updateTransaction(transaction.id, transaction)
                })
                return { action: 'send', result: `Failed to create order.` }
            }
        } catch (error) {
            throw error
        }
    }

}