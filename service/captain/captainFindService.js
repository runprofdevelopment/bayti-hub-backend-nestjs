const CaptainRepository = require('../../database/captainRepository');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError')

module.exports = class CaptainFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainRepository = new CaptainRepository();
        this.captainWalletRepository = new SubCollectionRepository('captains', 'wallets');
    }

    async findCaptainByAuthId(authId) {
        try {
            const filter = [
                { key: 'authenticationUid', operator: '==', value: authId },
                { key: 'isRemoved', operator: '==', value: false },
            ]
            const pagination = {
                action: "next",
                firstPage: true,
                limit: 10,
                orderBy: "createdBy",
                sortType: "asc"
            }

            const captains = await this.listCaptains(filter, pagination);

            if (captains.length === 0) {
                throw new CustomError(this.language, 'captain.error.captainNotFound');
            }

            return captains[0];
        } catch (error) {
            throw error;
        }
    }

    async findCaptainById(captainId) {
        try {
            const captain = await this.captainRepository.findCaptainById(captainId);
            if (!captain) {
                return null;
            }
            return captain;
        } catch (error) {
            throw error;
        }
    }

    async findCaptainByIdNotRemoved(captainId) {
        try {
            const captain = await this.findCaptainById(captainId);
            if (!captain || captain.isRemoved) {
                throw new CustomError(this.language, 'captain.error.captainNotFound');
            }
            return captain;
        } catch (error) {
            throw error;
        }
    }


    async listCaptains(filter, pagination) {
        try {
            const captains = await this.captainRepository.getCaptains(filter, pagination);
            for(const captain of captains){
                const wallet = await this.captainWalletRepository.findDocumentById(captain.id, captain.id);
                captain.walletAmount = wallet?.balance ?? 0
            }
            return captains;
        } catch (error) {
            throw error
        }
    }

    async isCapatainFoundByAuthId(authenticationUid) {
        try {
            const captain = await this.findCaptainByAuthId(authenticationUid);

            return captain !== null;
        } catch (error) {
            return false;
        }
    }

    async listCpatainsNotRemoved(filter, pagination) {
        try {
            const appendedFilters = [
                { key: 'isRemoved', operator: '==', value: false },
                ...filter
            ]
            return await this.listCaptains(appendedFilters, pagination);
        } catch (error) {
            throw error
        }
    }
}