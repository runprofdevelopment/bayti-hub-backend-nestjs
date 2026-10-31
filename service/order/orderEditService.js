const CollectionRepository = require('../../database/collectionRepository');
const CustomError = require('../../error/customeError');

module.exports = class OrderEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderRepository = new CollectionRepository("orders");
    }

    async editOrder(order, orderUpdate){
        try{
            return await this.orderRepository.editDocument(order.id, orderUpdate);
        }catch(error){
            throw error;
        }
    }
}