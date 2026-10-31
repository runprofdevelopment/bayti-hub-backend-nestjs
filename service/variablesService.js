const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');
const RealTimeRepository = require('../database/realTimeRepository');

module.exports = class VariablesService {
    constructor(currentUser, language, path) {
        this.currentUser = currentUser;
        this.language = language;
        this.realTimeRepository = new RealTimeRepository(path);
    }

    async getVariable(variableName) {
        try {
            const value = await this.realTimeRepository.getVariable(variableName);
            return value ?? 0;
        } catch (error) {
            throw error;
        }
    }

    async setVariable(variableName, value) {
        try {
            return await this.realTimeRepository.setVariable(variableName, value);
        } catch (error) {
            throw error;
        }
    }

    async incrementVariable(variableName) {
        try {
            const value = await this.getVariable(variableName);
            console.log("print value here");
            console.log(value);
            return await this.setVariable(variableName, value + 1);
        } catch (error) {
            throw error;
        }
    }

    async incrementVariableByValue(variableName, value) {
        try {
            const currentValue = await this.getVariable(variableName);
            return await this.setVariable(variableName, currentValue + value);
        } catch (error) {
            throw error;
        }
    }
}