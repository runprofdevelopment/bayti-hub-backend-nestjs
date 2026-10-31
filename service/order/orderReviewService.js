const admin = require('firebase-admin');
const { i18n } = require('../../i18n');
const OrderEditService = require('./orderEditService');
const CustomError = require('../../error/customeError');
const OrderFindService = require('./orderFindService');
const ClientFindService = require('../client/clientFindService');
const ChefReviewService = require('../chef/chefReviewService');

const REGION = 'europe-west1'

module.exports = class OrderReviewService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.orderEditService = new OrderEditService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.chefReviewService = new ChefReviewService(this.currentUser, this.language);
    }

    async reviewChef(orderId, review) {
        try {
            const rating = review.rating;
            const reviewString = review.review;

            const order = await this.orderFindService.findOrderById(orderId);
            const status = order.status;
            const client = await this.clientFindService.findClientById(order.clientId);

            if (status !== 'closed' || rating < 0 || rating > 5) {
                throw new CustomError(this.language, 'order.error.cannotReviewOrder');
            }

            if (order.chefReview) {
                throw new CustomError(this.language, 'order.error.alreadyReviewed');
            }

            const chefReview = {
                id: admin.firestore().collection(`ids`).doc().id,
                orderId,
                chefId: order.chefId,
                clientId: order.clientId,
                clientName: client.fullName ? client.fullName : "client",
                rating,
                review: reviewString,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: order.clientId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: order.clientId
            }
            // add review to order
            await this.orderEditService.editOrder(order, { chefReview, reviewed: true });

            // add review to the chef
            await this.chefReviewService.addChefReview(order.chefId, chefReview);

            return true;
        } catch (error) {
            throw error
        }
    }

    async skipReview(orderId) {
        try {
            const order = await this.orderFindService.findOrderById(orderId);
            if (order.status !== 'closed') {
                throw new CustomError(this.language, 'order.error.cannotReviewOrder');
            }
            await this.orderEditService.editOrder(order, { reviewed: true });

            return true;
        } catch (error) {
            throw error;
        }
    }
}