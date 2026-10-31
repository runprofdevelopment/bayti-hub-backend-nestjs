const admin = require('firebase-admin');
const functions = require("firebase-functions");
const VariablesService = require('../variablesService');
const ClientFindService = require('../client/clientFindService');
const ChefFindService = require('../chef/chefFindService');
const CartDeliveryService = require('../cart/cartDeliveryService');
const ClientAddressService = require('../client/clientAddressService');
const CollectionRepository = require('../../database/collectionRepository');
const ClientWalletService = require('../client/clientWalletService');
const TransactionService = require('../transactionService');
const CartCreateService = require('../cart/cartCreateService');
const OrderFindService = require('./orderFindService');
const ClientNotificationService = require('../client/clientNotificationService');
const ChefNotificationService = require('../chef/chefNotificationService');
const AdminWalletService = require('../admin/adminWalletService');
const CityService = require('../cityService');
const RajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const {serviceAccount} = require("../../config/config");
const ValidateService = require('../validateService');
const CustomError = require('../../error/customeError');
const { i18n } = require('../../i18n');

const REGION = 'europe-west1'

module.exports = class CheckoutService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.variablesService = new VariablesService(this.currentUser, this.language, "variables");
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        // this.cartFindService = new CartFindService(this.currentUser, this.language);
        this.cartDeliveryService = new CartDeliveryService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.orderRepository = new CollectionRepository("orders");
        this.clientAddressService = new ClientAddressService(this.currentUser, this.language);
        this.clientWalletService = new ClientWalletService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.cartCreateService = new CartCreateService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.cityService = new CityService(this.currentUser, this.language);
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
        this.RajhiBankGateway = new RajhiBankGateway();
    }

    async checkout(authId, orderInput) {
        try {
            const deliveryTime = orderInput.deliveryTime;
            const paymentMethod = orderInput.paymentMethod;
            const addressId = orderInput.addressId;

            const client = await this.clientFindService.findClientByAuthId(authId);
            const clientId = client.id;
            const address = await this.clientAddressService.findClientAddress(client, addressId);

            const CartFindService = require('../cart/cartFindService');
            const cartFindService = new CartFindService(this.currentUser, this.language);
            const cart = await cartFindService.findDetailedCartByClient(client);
            const chefId = cart.chefId;
            if (!chefId) {
                throw new CustomError(this.language, 'cart.error.emptyCart');
            }
            const chef = await this.chefFindService.findChefById(chefId);
            const chefSchedule = chef.kitchen.schedule;
            // Generate orderNo
            const orderNo = await this.variablesService.getVariable("orderNo");
            await this.variablesService.setVariable("orderNo", orderNo + 1);

            // Get commissions
            let chefRatio = await this.variablesService.getVariable("chefRatio");
            chefRatio = chefRatio / 100;
            let captainRatio = await this.variablesService.getVariable("captainRatio");
            captainRatio = captainRatio / 100;
            // amount of the meals ordered
            const cartAmount = cart.value;
            // check if the ordered amount less than the minimum order for this chef
            if (cartAmount < chef.kitchen.minOrderAmount) {
                throw new CustomError(this.language, 'order.error.orderAmountBelowMin');
            }
            // amount of the delivery
            let deliveryFees = await this.cartDeliveryService.findDeliveryFees(authId, addressId);
            deliveryFees = ValidateService.roundFloat(deliveryFees);
            
            // chef profit of the meals
            const chefProfit = ValidateService.roundFloat(cartAmount * chefRatio);
            // app profit of the meals
            const appOrderProfit = ValidateService.roundFloat(cartAmount * (1 - chefRatio));

            // captain profit of the delivery
            const captainProfit = ValidateService.roundFloat(deliveryFees * captainRatio);
            // app profit of the delivery
            const appDeliveryProfit = ValidateService.roundFloat(deliveryFees * (1 - captainRatio));

            // calc taxes
            const taxesRatio = await this.variablesService.getVariable("vat") / 100;
            // const taxes = ValidateService.roundFloat((appOrderProfit + appDeliveryProfit) * (taxesRatio));
            const taxes = ValidateService.roundFloat((cartAmount + deliveryFees) * (taxesRatio));

            // total amount of the order (meals + delivery + taxes)
            const totalAmount = ValidateService.roundFloat(cartAmount + deliveryFees + taxes);
            
            // app total profit
            const appTotalProfit = ValidateService.roundFloat((appOrderProfit + appDeliveryProfit) * (1 - taxesRatio));
            const QRCode = clientId + "//" + chefId + "//" + totalAmount;
            

            // get city of the order
            const city = await this.cityService.getCityFromLocation(address.lat, address.long);

            // calculate pickup time
            const deliveryPeriod = await this.variablesService.getVariable("deliveryTime");
            const pickUpTime = new Date(deliveryTime - (deliveryPeriod * 60 * 1000)).toISOString();
            
            const order = {
                id: admin.firestore().collection(`ids`).doc().id,
                orderNo : orderNo+"",
                QRCode,
                clientId,
                client,
                chefId,
                chef,
                cityId: city.id,
                city,
                captainId: null,
                captain: null,
                addressId,
                address,
                cart,
                cartAmount,
                deliveryFees,
                totalAmount,
                chefProfit,
                appOrderProfit,
                appDeliveryProfit,
                appTotalProfit,
                captainProfit,
                taxes,
                captainVisits: [],
                status: "shadow",
                paymentMethod,
                deliveryTime,
                reviewed: false,
                pickUpTime,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: client.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: client.id
            }
            await this.orderRepository.setDocument(order);

            // execute payment
            if (paymentMethod === "wallet") {
                return await this.executeWalletPayment(client, totalAmount, order.id);
            } else if (paymentMethod === "visa") {
                return await this.executeVisaPayment(client, totalAmount, order.id);
            }

            return true;
        } catch (error) {
            throw error
        }
    }

    async executeWalletPayment(client, amount, orderId) {
        try {
            await this.clientWalletService.addAmountToWallet(client.id, -amount, - amount);
            await this.adminWalletService.addAmountToWallet(amount, amount);
            const order = await this.orderFindService.findOrderById(orderId);
            
            const transaction = await this.transactionService.createTransaction({
                id: await admin.firestore().collection(`ids`).doc().id,
                type: 'order',
                amount,
                trackId: -1,
                objectType: 'order',
                objectId: order.id,
                objectNo: order.orderNo,
                payerType: 'client',
                payerId: client.id,
                payeeType: 'app',
                payeeId: -1,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                createdBy: client.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: client.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
            return await this.successOrderPayment(orderId);
        } catch (error) {
            throw error;
        }
    }

    async executeVisaPayment(client, amount, orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);

            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: admin.firestore().collection(`ids`).doc().id,
                action: "1",
                language: this.language ? this.language : 'en',
                responseURL: functions.config().env ? `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=checkout` :
                    `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=checkout`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {
                const transaction = await this.transactionService.createTransaction({
                    id: await admin.firestore().collection(`ids`).doc().id,
                    type: 'order',
                    trackId: response.trackId,
                    amount,
                    objectType: 'order',
                    objectId: order.id,
                    objectNo: order.orderNo,
                    payerType: 'client',
                    payerId: client.id,
                    payeeType: 'app',
                    payeeId: -1,
                    status: 'pending',
                    paymentMethod: 'visa',
                    paymentId: response.paymentId,
                    createdBy: client.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: client.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

                return {
                    transactionId: transaction.id,
                    paymentId: response.paymentId,
                    paymentPageUrl: response.paymentPageUrl,
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async successOrderPayment(orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            const client = order.client;
            // empty cart of client
            await this.cartCreateService.createEmptyCartForClient(client);
            // update order status
            await this.orderRepository.editDocument(orderId, { status: "inProgress" });

            // notification for client
            await this.clientNotificationService.notifyClient(client.id, {
                en: i18n('en', 'order.notification.checkoutClientTitle'),
                ar: i18n('ar', 'order.notification.checkoutClientTitle')
            }, {
                en: i18n('en', 'order.notification.checkoutClientBody'),
                ar: i18n('ar', 'order.notification.checkoutClientBody'),
            }, {
                key: 'checkout',
                value: `${orderId}`
            })

            // notification for chef
            await this.chefNotificationService.notifyChef(order.chef.id, {
                en: i18n('en', 'order.notification.checkoutChefTitle'),
                ar: i18n('ar', 'order.notification.checkoutChefTitle')
            }, {
                en: i18n('en', 'order.notification.checkoutChefBody'),
                ar: i18n('ar', 'order.notification.checkoutChefBody'),
            }, {
                key: 'checkout',
                value: `${orderId}`
            })

            return order;
        } catch (error) {
            throw error;
        }
    }
}