const admin = require('firebase-admin')
const lodash = require('lodash')
const CustomError = require('../../error/customeError')

module.exports = class FireStorePaginationHelper {
    constructor() {}

    async applyFilter(docsRef, filter) {
        try {
            this.mapDateToTimeStampIfFound(filter)
            // Applying filters
            for (const fi of filter) {
                const finalOperator = this.mapOperator(fi.operator)

                if (fi.values) {
                    fi.value = fi.values
                }
                if (finalOperator === 'startsWith') {
                    //  make special case query for starts with
                    docsRef = docsRef.where(fi.key, '>=', fi.value).where(fi.key, '<=', fi.value + '\uf8ff')
                } else {
                    docsRef = docsRef.where(fi.key, finalOperator, fi.value)
                }
            }
            return docsRef
        } catch (error) {
            throw error
        }
    }

    mapOperator(operator) {
        if (operator === 'less') {
            return '<'
        } else if (operator === 'lessEqual') {
            return '<='
        } else if (operator === 'greater') {
            return '>'
        } else if (operator === 'greaterEqual') {
            return '>='
        } else if (operator === 'equal') {
            return '=='
        } else if (operator === 'notEqual') {
            return '!='
        } else if (operator === 'startsWith') {
            return 'startsWith'
        } else if (operator === 'notIn') {
            return 'not-in'
        } else if (operator === 'arrayContains') {
            return 'array-contains'
        } else if (operator === 'arrayContainsAny') {
            return 'array-contains-any'
        } else {
            return operator
        }
    }

    mapDateToTimeStampIfFound(filter) {
        try {
            for (const fi of filter) {
                if (!isNaN(Number(fi.value))) {
                    continue;
                }
                const date = new Date(fi.value)
                if ((fi.key === "createdAt" || fi.key === "updatedAt" || fi.key.includes("Time")) && fi.value && date instanceof Date && !isNaN(date)) {
                    fi.value = admin.firestore.Timestamp.fromDate(date)
                }
            }
        } catch (error) {
            throw error
        }
    }
}