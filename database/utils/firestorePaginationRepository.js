const FirebaseRepository = require('../utils/firebaseRepository');
const admin = require('firebase-admin');
const assert = require('assert');
const moment = require('moment');
const lodash = require('lodash');

module.exports = class FirestorePaginationRepository {
  /**
   * 
   * @param {*} collectionName This is collection name or collection ref 
   * @param {*} pageSize Number of records to be returned
   * @param {*} field 
   */
  constructor({ collectionName, pageSize, field, orderBy, sortBy, filter }) {
    this.pageSize = pageSize;
    this.orderBy = orderBy;
    this.sortBy = sortBy || 'asc';
    this.field = field;
    this.ref = this._generateRef(collectionName, filter)
  }

  _generateRef(collectionName, filter = []) {
    // console.log('sortBy = ', this.sortBy);
    // console.log('orderBy = ', this.orderBy);
    let ref = admin.firestore().collection(collectionName)

    // if ((Array.isArray(filter) && !filter.length) || !filter || Object.keys(filter).length === 0) {
    //   return ref.orderBy(this.orderBy, this.sortBy)
    // }

    const orderByFieldsMandatory = [] 
    filter.forEach(el => {
      ref = ref.where(el.field, el.operator, el.value)
      if (el.operator === '!=' || el.operator === '<' || el.operator === '<=' || el.operator === '>' || el.operator === '>=') {
        orderByFieldsMandatory.push(el.field)
      }
    });
    
    if (!lodash.isEmpty(this.orderBy) && lodash.isString(this.orderBy) && !orderByFieldsMandatory.includes(this.orderBy)) {
      orderByFieldsMandatory.push(this.orderBy)
    }

    const uniqueOrderBy = [...new Set(orderByFieldsMandatory)]
    uniqueOrderBy.forEach(fieldName => {
      ref = ref.orderBy(fieldName, this.sortBy)
    });

    return ref
  }

  async firstPage() {
    console.log('Get first page....');
    return this.ref.limit(this.pageSize);
  }

  async nextPage(pagination) {
    if (pagination.page && pagination.page > 0) {
      return this.nextPageByCurrentPage(pagination.page)
    } else if (pagination.offset && pagination.offset > 0) {
      return this.nextPageByOffset(pagination.offset)
    } else if (pagination.doc && pagination.doc[this.field] ) {
      return this.nextPageByDocument(pagination.doc)
    } else {
      return this.firstPage()
    }
  }

  async prevPage(pagination) {
    if (pagination.page && pagination.page > 1) {
      return this.prevPageByCurrentPage(pagination.page)
    } else if (pagination.offset && pagination.offset > 0) {
      return this.nextPageByOffset(pagination.offset)
    } else if (pagination.doc && pagination.doc[this.field] ) {
      return this.prevPageByDocument(pagination.doc)
    } else {
      return this.firstPage()
    }
  }

//#region [ By document / record ]
  async nextPageByDocument(last) {
    console.log('Get next page by document / record....');
    let value = last[this.field]
    console.log('Value Before = ', value);
    // console.log(moment(value, moment.ISO_8601, true).isValid());
    if (lodash.isDate(value)) {
      console.log('Value IS Date =', lodash.isDate(value));
      // if (!isNaN(Date.parse(value.replace(/at/g, '')))) {
      // value = new Date(value.replace(/at/g, ''))
      // value = value.setHours(value.getHours() - 2)
      // value = new Date(value)
      // value = moment.utc(value, "YYYY-MM-DD hh:mm:ss");

      // value = moment.utc(value.replace(/at/g, ''), "YYYY-MM-DD hh:mm:ss");
      value = FirebaseRepository.convertToTimestampIfIsNot(new Date(value))
    }
    console.log('Value After = ', value);

    return this.ref.startAfter(value).limit(this.pageSize);
  }

  async prevPageByDocument(first) {
    console.log('Get previous page by document / record....');
    let value = first[this.field]
    console.log('Value Before = ', value);
    // console.log(moment(value, moment.ISO_8601, true).isValid());
    if (lodash.isDate(value)) {
      console.log('Value IS Date =', lodash.isDate(value));
      // if (!isNaN(Date.parse(value.replace(/at/g, '')))) {
      // value = Date.parse(value.replace(/at/g, ''))
      // value = moment.utc(value.replace(/at/g, ''), "YYYY-MM-DD hh:mm:ss");
      value = FirebaseRepository.convertToTimestampIfIsNot(new Date(value))
    }
    console.log('Value After = ', value);

    return this.ref.endBefore(value).limitToLast(this.pageSize);
  }
//#endregion

//#region [ By current page number ]
  async currentPage(currentPage) {
    console.log('Get current page by current page number....');
    assert((currentPage > 0), 'Page number must be greater than zero');  

    const offset = currentPage > 0 
    ? (currentPage - 1) * this.pageSize 
    : 0;
    const limit = currentPage > 0 ? this.pageSize : 0;
    return this.ref.limit(limit).offset(offset);
  }

  async nextPageByCurrentPage(currentPage) {
    console.log('Get next page by current page number....');
    assert((currentPage > 0), 'Page number must be greater than zero');  

    const offset = currentPage * this.pageSize 

    return this.ref.limit(this.pageSize).offset(offset);
  }

  async prevPageByCurrentPage(currentPage) {
    console.log('Get previous page by current page number....');
    assert((currentPage > 1), 'Page number must be greater than one');  
    
    const offset = (currentPage - 2) * this.pageSize 

    return this.ref.limit(this.pageSize).offset(offset);
  }
//#endregion

//#region [ By offset number ]
  async nextPageByOffset(offset) {
    console.log('Get next page by offset number....');
    assert((offset >= 0), 'The offset must be non-negative number');  
    
    return this.ref.limit(this.pageSize).offset(offset);
  }

  async prevPageByOffset(offset) {
    console.log('Get previous page by offset number....');
    assert((offset >= 0), 'The offset must be non-negative number');  
  
    return this.ref.limit(this.pageSize).offset(offset);
  }
//#endregion

  async getPagination(collection) {
    if (!collection || !collection.length) return
    const firstDocument = collection[0]
    const lastDocument = collection[collection.length - 1]
    const hasPreviousDocument = await this.hasPreviousDocument(firstDocument)
    const hasNextDocument = collection.length < this.pageSize ? false : await this.hasNextDocument(lastDocument)
    // const totalCount = await this.count()
   
    return {
      // currentPage: 0,
      // count: totalCount,
      // totalRowsNumber: totalCount,
      // firstRowIndex: 0,
      // endRowIndex: collection.length - 1,
      // pagesNumber: Math.ceil(totalCount / this.pageSize),
      pageSize: collection.length,
      isFirstPage: !hasPreviousDocument,
      isLastPage: !hasNextDocument,
    }
  }

  async hasNextDocument(last) {
    console.log('Get next document by last document / record....');
    let value = last[this.field]
    console.log('Value Before = ', value);
    if (lodash.isDate(value)) {
      console.log('Value IS Date =', lodash.isDate(value));
      value = FirebaseRepository.convertToTimestampIfIsNot(new Date(value))
    }
    console.log('Value After = ', value);
    return (await this.ref.startAfter(value).limit(1).get()).size > 0;
  }

  async hasPreviousDocument(first) {
    console.log('Get previous document by first document / record....');
    let value = first[this.field]
    console.log('is number', lodash.isNumber(value))
    console.log('Value Before = ', value);
    if (lodash.isDate(value)) {
      console.log('Value IS Date =', lodash.isDate(value));
      value = FirebaseRepository.convertToTimestampIfIsNot(new Date(value))
    }
    console.log('Value After = ', value);
    const doc = FirebaseRepository.mapCollection(await this.ref.endBefore(value).limitToLast(1).get())
    // console.log('Previous document =', doc);

    return doc.length > 0 && doc.filter(el => el.id !== first.id).length
    // return (await this.ref.endBefore(value).limitToLast(1).get()).size > 0;
  }

  async count() {
    // let chain = admin
    //   .firestore()
    //   .collection(new Transaction().collectionName);

    // if (filter) {
    //   Object.keys(filter).forEach((key) => {
    //     chain = chain.where(key, '==', filter[key]);
    //   });
    // }

    return (await this.ref.get()).size;
  }
};