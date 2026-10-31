const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class BadgeRepository {
    constructor() {
        this.collectionName = 'badges'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async incrementChefAddBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefAddBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async decrementChefAddBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefAddBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async incrementCaptainAddBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainAddBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async decrementCaptainAddBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainAddBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async incrementChefUpdateBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefUpdateBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async decrementChefUpdateBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefUpdateBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async incrementCaptainUpdateBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainUpdateBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async decrementCaptainUpdateBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainUpdateBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async incrementChefRequestBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefRequestBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async deccrementChefRequestBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`chefRequestBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async incrementCaptainRequestBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainRequestBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    async deccrementCaptainRequestBadge(){
        try{
            const db = getDatabase()
            const ref = db.ref(`captainRequestBadge`)
            await ref.update({
                value: admin.database.ServerValue.increment(-1)
            })
            return true
        }catch(error){
            throw error
        }
    }

    
}