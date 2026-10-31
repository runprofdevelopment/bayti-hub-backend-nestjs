const admin = require('firebase-admin');
const CaptainRepository = require('../../database/captainRepository');
const CaptainFindService = require('./captainFindService');

module.exports = class CaptainBankAccountService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainRepository = new CaptainRepository();
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
    }

    async addBankAccount(authId, bankAccount) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);

            const defaultBankAccount = await this.getDefaultBankAccount(captain);

            const bankAccountObj = {
                ...bankAccount,
                isDefault: defaultBankAccount == null,
                isRemoved: false,
                id: admin.firestore().collection(`ids`)
                    .doc().id
            }

            return await this.captainRepository.addBankAccount(captain.id, bankAccountObj);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainBankAccountsByAuthId(authId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.listCaptainBankAccounts(captain);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainBankAccountsById(captainId) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.listCaptainBankAccounts(captain);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainBankAccounts(captain) {
        try {
            return await this.captainRepository.getBankAccountsOfCaptain(captain.id);
        } catch (error) {
            throw error
        }
    }

    async editBankAccount(authId, bankAccountId, bankAccountUpdate) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const captainId = captain.id;

            return await this.captainRepository.updateBankAccount
                (captainId, bankAccountId, bankAccountUpdate);
        } catch (error) {
            throw error
        }
    }

    async setDefaultBankAccountByAuthId(authId, bankAccountId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.setDefaultBankAccount(captain, bankAccountId);
        } catch (error) {
            throw error;
        }
    }

    async setDefaultBankAccount(captain, bankAccountId) {
        try {
            const captainId = captain.id;

            const defaultBankAccount = await this.getDefaultBankAccount(captain);
            if (defaultBankAccount !== null) {
                await this.captainRepository.updateBankAccount(captainId, defaultBankAccount.id, { isDefault: false })
            }
            return await this.captainRepository.updateBankAccount(captainId, bankAccountId, { isDefault: true })
        } catch (error) {
            throw error
        }
    }

    async getDefaultBankAccountByAuthId(authId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.getDefaultBankAccount(captain);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultBankAccountById(captainId) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.getDefaultBankAccount(captain);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultBankAccount(captain) {
        try {
            return await this.captainRepository.getDefaultBankAccountOfCaptain(captain.id);
        } catch (error) {
            throw error
        }
    }

    async removeBankAccount(authId, bankAccountId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const captainId = captain.id;
            // remove bank account
            await this.captainRepository.updateBankAccount
                (captainId, bankAccountId, { isRemoved: true, isDefault: false })
            const defaultBankAccount = await this.getDefaultBankAccount(captain);
            // If the removed bank account was default,
            // choose the first remaining bank account to be the default one
            if (defaultBankAccount === null) {
                const bankAccounts = await this.listCaptainBankAccounts(captain);
                if (bankAccounts.length > 0) {
                    await this.setDefaultBankAccount(captain, bankAccounts[0].id);
                }
            }
            return true
        } catch (error) {
            throw error
        }
    }

    async getCaptainBankAccountBydId(captainId, bankAccountId) {
        try {
            return await this.captainRepository.getCaptainBankAccountById(captainId, bankAccountId)
        } catch (error) {
            throw error
        }
    }
}