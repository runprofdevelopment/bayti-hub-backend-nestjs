const admin = require('firebase-admin')
const lodash = require('lodash')
const CustomError = require('../../error/customeError')

module.exports = class FireStorePaginationHelper {
    constructor() {

    }

    async applyPagination(docsRef, pagination) {
        try {
            if (!pagination) {
                return docsRef
            }

            const { firstPage, limit, orderBy, sortType, action, offset } = pagination
            if (offset || offset === 0) {
                // Use offset for pagination
                // Get all documents for the offset and the limit and return the remaining
                docsRef = docsRef.orderBy(orderBy, sortType).limit(offset + limit);
            } else {
                // Use cursor for pagination
                if (firstPage) {
                    if (action === 'next') {
                        docsRef = docsRef.orderBy(orderBy, sortType).limit(limit)
                    } else if (action === 'prev') {
                        throw new CustomError('en', 'pagination.errors.errorPrevious')
                    }
                } else {
                    const doc = pagination.doc
                    if (!doc) {
                        throw new CustomError('en', 'pagination.errors.missedDoc')
                    }

                    let value = doc[orderBy]
                    const date = new Date(value)
                    if (!isNaN(date.getDate())) {
                        value = this.convertToTimestampIfIsNot(new Date(value))
                    }
                    if (action === 'next') {
                        docsRef = docsRef.orderBy(orderBy, sortType)
                            .startAfter(value).limit(limit)

                    } else if (action === 'prev') {
                        docsRef = docsRef.orderBy(orderBy, sortType)
                            .endBefore(value).limitToLast(limit)
                    }
                }
            }

            return docsRef;
        } catch (error) {
            throw error;
        }
    }

    convertToTimestampIfIsNot(value) {
        if (!value) {
            return value;
        }

        if (!(value instanceof admin.firestore.Timestamp)) {
            if (lodash.isNumber(value)) {
                return admin.firestore.Timestamp.fromMillis(value);
            }

            if (lodash.isDate(value)) {

                const date = new Date(value)
                return admin.firestore.Timestamp.fromDate(date);
            }

            throw new Error(`Error adding audition fields!`);
        }
        return value;
    }

}