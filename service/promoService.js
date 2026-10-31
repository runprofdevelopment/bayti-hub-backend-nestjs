const admin = require('firebase-admin')
const UserService = require('./user/userService')
const PromoRepository = require('../database/promoRepository')
const CustomError = require('../error/customeError')

module.exports = class PromoService {
    constructor(user, currentUser, language) {
        this.user = user
        this.currentUser = currentUser
        this.language = language
        this.userService = new UserService(user, currentUser, language)
        this.promoRepository = new PromoRepository(user, currentUser, language)
    }

    async addPromoCode(promoInput) {
        try {
            const uid = this.currentUser.uid

            const discount = promoInput.discount
            const startDate = promoInput.startDate
            const endDate = promoInput.endDate
            const maxUses = promoInput.maxUses

            if (discount <= 0) {
                throw new CustomError(this.language, 'promo.error.notPositiveDiscount')
            }
            if (discount > 99) {
                throw new CustomError(this.language, 'promo.error.moreThanHundredDiscount')
            }

            if (maxUses <= 0) {
                throw new CustomError(this.language, 'promo.error.notPositiveMaxUses')
            }

            const currentTime = admin.firestore.FieldValue.serverTimestamp()
            if (startDate <= currentTime) {
                throw new CustomError(this.language, 'promo.error.pastPromoCode')
            }

            if (endDate <= currentTime) {
                throw new CustomError(this.language, 'promo.error.pastPromoCode')
            }

            if (endDate <= startDate) {
                throw new CustomError(this.language, 'promo.error.endBeforeStart')
            }

            const promoCode = {
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                ...promoInput,
                totalUses: 0,
                status: 'enabled',
                createdBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            await this.promoRepository.addPromoCode(promoCode)

            return promoCode
        } catch (error) {
            throw error
        }
    }

    async setPromoCodesStatus(promoCodesIds, status) {
        try {
            const finalStatus = status ? 'enabled' : 'disabled'
            for (const promoCodeId of promoCodesIds) {
                await this.promoRepository.setPromoCodeStatus(promoCodeId, finalStatus)
            }

            return true
        } catch (error) {
            throw error
        }
    }

    async getPromoCodes(pagination) {
        try {
            const promos = await this.promoRepository.getPromoCodes(pagination)
            console.log(promos)

            return promos
        } catch (error) {
            throw error
        }
    }

    async getPromoCodeByCode(promoCode){
        try{
            return await this.promoRepository.getPromoCodeByCode(promoCode)
        }catch(error){
            throw error
        }
    }

    async validatePromoCode(promoCode) {
        try {
            const uid = this.currentUser.uid
            const promo = await this.promoRepository.getPromoCodeByCode(promoCode)
            if (!promo || promo === null || promo.status === 'disabled') {
                throw new CustomError(this.language, 'promo.error.wrongPromo')
            }

            const valid = await this.userService.isValidPromo(uid, promo)

            if (valid) {
                return { 'discount': promo.discount }
            } else {
                throw new CustomError(this.language, 'promo.error.PromoNotAllowedForUser')
            }
        } catch (error) {
            throw error
        }
    }

    async usePromo(promoCode) {
        try {
            if (!this.validatePromoCode(promoCode)) {
                return
            }

            const promo = await this.promoRepository.getPromoCodeByCode(promoCode)

            await this.userService.usePromo(this.currentUser.uid, promo)
            await this.promoRepository.incrementPromoUses(promo.id)

            return true
        } catch (error) {
            throw error
        }
    }

}