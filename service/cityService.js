const admin = require('firebase-admin');
const NodeGeocoder = require('node-geocoder');
const CollectionRepository = require('../database/collectionRepository');

module.exports = class CityService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.cityRepository = new CollectionRepository("cities");
    }

    async addCity(cityNameEn, cityNameAr) {
        try {
            const existedCity = await this.findCityById(cityNameEn);
            if (existedCity) {
                return existedCity;
            }
            const city = {
                id: cityNameEn,
                en: cityNameEn,
                ar: cityNameAr
            };

            return await this.cityRepository.setDocument(city);
        } catch (error) {
            throw error;
        }
    }

    async listCities() {
        try {
            const cities = await this.cityRepository.listDocuments([], undefined);

            return cities;
        } catch (error) {
            throw error;
        }
    }

    async findCityById(cityId) {
        try {
            return await this.cityRepository.findDocumentById(cityId);
        } catch (error) {
            throw error
        }
    }

    async getCityFromLocation(lat, lon) {
        try {
            const optionsEn = {
                provider: 'google',
                apiKey: 'AIzaSyCq3i5-3KPewMAoHBCSR2NHw174LoQXppI', // for Mapquest, OpenCage, Google Premier
                formatter: null, // 'gpx', 'string', ...
                language: "en"
            };

            const optionsAr = {
                provider: 'google',
                apiKey: 'AIzaSyCq3i5-3KPewMAoHBCSR2NHw174LoQXppI', // for Mapquest, OpenCage, Google Premier
                formatter: null, // 'gpx', 'string', ...
                language: "ar"
            }

            const geocoderEn = NodeGeocoder(optionsEn);
            const geocoderAr = NodeGeocoder(optionsAr);

            const resEn = await geocoderEn.reverse({ lat, lon });
            const resAr = await geocoderAr.reverse({ lat, lon });

            const cityNameEn = resEn[0].city ? resEn[0].city : resEn[0].administrativeLevels.level1short;
            const cityNameAr = resAr[0].city ? resAr[0].city : resAr[0].administrativeLevels.level1short;
            if (cityNameEn) {
                return await this.addCity(cityNameEn, cityNameAr);
            }
            return {
                id: "none",
                en: "none",
                ar: "none"
            };
        } catch (error) {
            throw error;
        }
    }
}