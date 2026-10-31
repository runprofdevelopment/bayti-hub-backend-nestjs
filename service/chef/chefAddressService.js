const ChefFindService = require('./chefFindService');
const ChefEditService = require('./chefEditService');
const ValidateService = require('../validateService');
const AlgoliaService = require('../algoliaService');
const CityService = require('../cityService');

module.exports = class ChefAddressService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService(this.currentUser, this.language);
        this.cityService = new CityService(this.currentUser, this.language);
    }

    async setChefAddress(authId, address) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefId = chef.id;

            ValidateService.validateAddress(address);

            const addressObj = {
                ...address,
                isDefault: true,
                id: chefId
            }

            const city = await this.cityService.getCityFromLocation(address.lat, address.long);
            if (city) {
                addressObj.cityId = city.id;
                addressObj.city = city;
            }
            await this.chefEditService.editChef(chef, { address: addressObj, city});

            const updatedChef = await this.chefFindService.findChefById(chefId);
            // edit algolia
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            return true;
        } catch (error) {
            throw error
        }
    }


}