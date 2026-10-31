const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');
const ChefFindService = require('../service/chef/chefFindService');
const ClientFindService = require('../service/client/clientFindService');
const CaptainFindService = require('../service/captain/captainFindService');
const FirestoreRepositoryHelper = require('../database/helper/firestoreRepositoryHelper');
const FireStorePaginationHelper = require('../database/helper/firestorePaginationHelper');
const FirestoreFilterHelper = require('../database/helper/firestoreFilterHelper');

module.exports = class TransactionService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.transactionRepository = new CollectionRepository("transactions");
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.fireStorePaginationHelper = new FireStorePaginationHelper();
        this.fireStoreFilterHelper = new FirestoreFilterHelper();
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper();
    }

    async createTransaction(transaction) {
        try {
            return await this.transactionRepository.setDocument(transaction);
        } catch (error) {
            throw error
        }
    }

    async getTransactionsByTrackId(trackId) {
        try {
            const filter = [
                { key: 'trackId', value: trackId, operator: '==' }
            ];
            return await this.transactionRepository.listDocumentsByFilter(filter);

        } catch (error) {
            throw error
        }
    }

    async updateTransaction(transactionId, transaction) {
        try {
            return await this.transactionRepository.editDocument(transactionId, transaction);
        } catch (error) {
            throw error
        }
    }


    async listTransactions(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ];
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientInTransactionsByAuthId(authId, pagination) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.listClientInTransactions(client, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientInTransactionsById(clientId, filter, pagination) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.listClientInTransactions(client, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientInTransactions(client, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payeeId', operator: '==', value: client.id },
                { key: 'payeeType', operator: '==', value: 'client' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ];
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientOutTransactionsByAuthId(authId, pagination) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.listClientOutTransactions(client, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientOutTransactionsById(clientId, filter, pagination) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.listClientOutTransactions(client, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientOutTransactions(client, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payerId', operator: '==', value: client.id },
                { key: 'payerType', operator: '==', value: 'client' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listWalletTransactionsById(walletId, filter, pagination) {
        try {
            let docsRef = admin.firestore().collection("transactions");
            docsRef = docsRef.where(
                Filter.or(
                    Filter.where("payerId", "==", walletId),
                    Filter.where("payeeId", "==", walletId)
                )).where("status", "==", "success");
            console.log("after or filtering");
            docsRef = await this.fireStoreFilterHelper.applyFilter(docsRef, filter);

            // Apply pagination
            docsRef = await this.fireStorePaginationHelper.applyPagination(docsRef, pagination);

            const collection = await docsRef.get();

            // Map collection
            if (collection.empty) {
                return [];
            }
            const list = this.firestoreRepositoryHelper.mapCollection(collection);
         const listWithCode=[]
            for(let i=0;i<list.length;i++){
                if(list[i].payerType!=="app"){
                    if(list[i].payerType==="chef"){
                        const payer=await admin.firestore().collection("chefs").doc(list[i].payerId).get()
                       listWithCode.push({code:payer.data().code,...list[i]}) 
                    }
                    if(list[i].payerType==="client"){
                        const payer=await admin.firestore().collection("clients").doc(list[i].payerId).get()
                       listWithCode.push({code:payer.data().code,...list[i]}) 
                    }
                    if(list[i].payerType==="captain"){
                        const payer=await admin.firestore().collection("captains").doc(list[i].payerId).get()
                       listWithCode.push({code:payer.data().code,...list[i]}) 
                    }
                }else{
                    if(list[i].payeeType==="chef"){
                        const payee=await admin.firestore().collection("chefs").doc(list[i].payeeId).get()
                       listWithCode.push({code:payee.data().code,...list[i]}) 
                    }
                    if(list[i].payeeType==="client"){
                        const payee=await admin.firestore().collection("clients").doc(list[i].payeeId).get()
                       listWithCode.push({code:payee.data().code,...list[i]}) 
                    }
                    if(list[i].payeeType==="captain"){
                        const payee=await admin.firestore().collection("captains").doc(list[i].payeeId).get()
    
                       listWithCode.push({code:payee.data().code,...list[i]}) 
                    }
                }
            }
            return listWithCode;
        } catch (error) {
            throw error;
        }
    }

    async listChefInTransactionsByAuthId(authId, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.listChefInTransactions(chef, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefInTransactionsByChefId(chefId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.listChefInTransactions(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefInTransactions(chef, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payeeId', operator: '==', value: chef.id },
                { key: 'payeeType', operator: '==', value: 'chef' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefOutTransactionsByAuthId(authId, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.listChefOutTransactions(chef, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefOutTransactionsByChefId(chefId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.listChefOutTransactions(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefOutTransactions(chef, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payerId', operator: '==', value: chef.id },
                { key: 'payerType', operator: '==', value: 'chef' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainInTransactionsByAuthId(authId, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.listCaptainInTransactions(captain, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainInTransactionsByCaptainId(captainId, filter, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.listCaptainInTransactions(captain, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainInTransactions(captain, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payeeId', operator: '==', value: captain.id },
                { key: 'payeeType', operator: '==', value: 'captain' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error
        }
    }

    async listCaptainOutTransactionsByAuthId(authId, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.listCaptainOutTransactions(captain, [], pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainOutTransactionsByCaptainId(captainId, filter, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.listCaptainOutTransactions(captain, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainOutTransactions(captain, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payerId', operator: '==', value: captain.id },
                { key: 'payerType', operator: '==', value: 'captain' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listAppOutTransactions(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payerId', operator: '==', value: "-1" },
                { key: 'payerType', operator: '==', value: 'app' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listAppInTransactions(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'payeeId', operator: '==', value: "-1" },
                { key: 'payeeType', operator: '==', value: 'app' },
                { key: 'status', operator: 'in', values: ['success', 'fail'] }
            ]
            return await this.transactionRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }
}