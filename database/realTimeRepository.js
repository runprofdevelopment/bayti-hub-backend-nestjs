const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');

module.exports = class RealTimeRepository {
    constructor(path) {
        this.path = path;
    }

    async setVariable(name, value) {
        try {
            const db = getDatabase();
            const ref = db.ref(`${this.path}/${name}`);
            await ref.set({
                value
            })

            return value;
        } catch (error) {
            throw error;
        }
    }

    async getVariable(name) {
        try {
            const db = getDatabase();
            const ref = db.ref(`${this.path}/${name}`);
            const collection = await ref.get();
            const data = collection.val();

            return data ? data.value : 0;
        } catch (error) {
            throw error;
        }
    }

    async updateVariable(name, update) {
        try {
            const db = getDatabase();
            const ref = db.ref(`${this.path}/${name}`);
            return ref.update(update);
        } catch (error) {
            throw error;
        }
    }
}