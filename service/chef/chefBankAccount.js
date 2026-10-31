const admin = require('firebase-admin');
const ChefRepository = require('../../database/chefRepository');
const ChefFindService = require('./chefFindService');

module.exports = class ChefBankAccountService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefRepository = new ChefRepository();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
    }

    async addBankAccount(authId, bankAccount) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefId = chef.id;

            const defaultBankAccount = await this.getDefaultBankAccountById(chefId);

            const bankAccountObj = {
                ...bankAccount,
                isDefault: defaultBankAccount == null,
                isRemoved: false,
                id: admin.firestore().collection(`ids`).doc().id
            }

            return await this.chefRepository.addBankAccount(chefId, bankAccountObj);
        } catch (error) {
            throw error;
        }
    }

    async editBankAccount(authId, bankAccountId, bankAccountUpdate) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefId = chef.id;

            return await this.chefRepository.updateBankAccount(chefId, bankAccountId, bankAccountUpdate);
        } catch (error) {
            throw error;
        }
    }

    async setDefaultBankAccount(authId, bankAccountId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefId = chef.id;

            const defaultBankAccount = await this.getDefaultBankAccountById(chefId);
            if (defaultBankAccount !== null) {
                await this.chefRepository.updateBankAccount(chefId, defaultBankAccount.id, { isDefault: false });
            }
            return await this.chefRepository.updateBankAccount(chefId, bankAccountId, { isDefault: true });
        } catch (error) {
            throw error;
        }
    }

    async removeBankAccount(authId, bankAccountId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefId = chef.id;
            // remove bank account
            await this.chefRepository.updateBankAccount
                (chefId, bankAccountId, { isRemoved: true, isDefault: false });
            const defaultBankAccount = await this.getDefaultBankAccountById(chefId);
            // If the removed bank account was default,
            // choose the first remaining bank account to be the default one
            if (defaultBankAccount === null) {
                const bankAccounts = await this.listChefBankAccounts(chef);
                if (bankAccounts.length > 0) {
                    await this.setDefaultBankAccount(authId, bankAccounts[0].id);
                }
            }
            return true
        } catch (error) {
            throw error
        }
    }

    async getChefBankAccountById(chefId, bankAccountId) {
        try {
            return await this.chefRepository.getChefBankAccountById(chefId, bankAccountId);
        } catch (error) {
            throw error
        }
    }

    async getDefaultBankAccountByAuthId(authId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);

            return await this.getDefaultBankAccountById(chef.id);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultBankAccountById(chefId) {
        try {
            return await this.chefRepository.getDefaultBankAccountOfChef(chefId);
        } catch (error) {
            throw error;
        }
    }

    async listChefBankAccountsById(chefId) {
        try {
            const chef = await this.chefFindService.findChefByIdNotRemoved(chefId);
            return await this.listChefBankAccounts(chef);
        } catch (error) {
            throw error;
        }
    }

    async listChefBankAccountsByAuthId(authId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.chefRepository.getBankAccountsOfChef(chef.id);
        } catch (error) {
            throw error
        }
    }

    async listChefBankAccounts(chef) {
        try {
            return await this.chefRepository.getBankAccountsOfChef(chef.id);
        } catch (error) {
            throw error;
        }
    }
}