const CountryRepository = require('../database/countryRepository')
const CustomError = require('../error/customeError')

module.exports = class CountryService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.countryRepository = new CountryRepository()
    }

    async listCountries() {
        try {
            return await this.countryRepository.getCountries();
        } catch (error) {
            throw error
        }
    }

    async listCities(countryId) {
        try {
            return await this.countryRepository.getCountryCities(countryId);
        } catch (error) {
            throw error
        }
    }

    async getCity(countryId, cityId) {
        try {
            const city = await this.countryRepository.getCity(countryId, cityId);
            if (!city || city === null) {
                throw new CustomError(this.language, 'errors.validation.cityNotFound');
            }
            return city;
        } catch (error) {
            throw error;
        }
    }

}