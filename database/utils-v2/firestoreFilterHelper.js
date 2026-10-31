const admin = require('firebase-admin');
const lodash = require('lodash');
const HelperFunctions = require('./helperFunctions');

/**
 * => Query limitations
 * - The following list summarizes Cloud Firestore query limitations:
 * - [1] Cloud Firestore provides limited support for logical OR queries. 
 *     The (in, and array-contains-any) operators support a logical OR of up to 10 equality (==) or array-contains conditions on a single field. 
 *     For other cases, create a separate query for each OR condition and merge the query results in your app.
 * - [2] In a compound query, range (<, <=, >, >=) and not equals (!=, not-in) comparisons must all filter on the same field.
 * - [3] You can use at most one (array-contains) clause per query. 
 * - [4] You can't combine (not-in) with not equals (!=).
 * - [5] You can't combine (array-contains) with (array-contains-any).
 * - [6] You can use at most one (in, not-in, or array-contains-any) clause per query. 
 * - [7] You can't combine (in , not-in, and array-contains-any) in the same query.
 * - [8] Use the (in) operator to combine up to 10 equality (==) clauses on the same field with a logical OR.
 * - [9] Use the (not-in) operator to combine up to 10 not equal (!=) clauses on the same field with a logical AND.
 * - [10] (not-in) queries exclude documents where the given field does not exist.
 * - [11] Use the (array-contains-any) operator to combine up to 10 (array-contains) clauses on the same field with a logical OR.
 * - [12] You can't order your query by a field included in an equality (==) or in clause.
 * - [13] The sum of filters, sort orders, and parent document path (1 for a subcollection, 0 for a root collection) in a query cannot exceed 100.
 */
module.exports = class FirestoreFilterHelper {
  
  static applyFilter(ref, filter, orderBy, sortBy) {
    try {
      // this.mapDateToTimeStampIfFound(filter);
      let hasFilterConstraint = false
      const orderByFieldsMandatory = []

      // Applying filters
      for (const iterator of filter) {
        if (iterator.values && iterator.values.length) {
          iterator.value = iterator.values;
        }

        const FIELD_NAME = iterator.field
        const OPERATOR = this.mapOperator(iterator.operator);
        const VALUE = this.castValue(iterator.value)

        if (OPERATOR == 'like') { 
          // Notes: Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().
          const searchField = FIELD_NAME.includes('normalize') ? FIELD_NAME : `normalize_${FIELD_NAME}`
          const searchText = HelperFunctions.stringNormalization(VALUE)
          ref = ref.orderBy(searchField, sortBy).startAt(searchText).endAt(searchText + "\uf8ff")
          hasFilterConstraint = true
          return { ref, hasFilterConstraint }
        } else if (OPERATOR === 'startsWith') {
          //  make special case query for starts with
          ref = ref.where(FIELD_NAME, '>=', VALUE).where(FIELD_NAME, '<=', VALUE + '\uf8ff');
        } else {
          ref = ref.where(FIELD_NAME, OPERATOR, VALUE)
        }
    
        if (OPERATOR === '!=' || OPERATOR === 'not-in' || OPERATOR === '<' || OPERATOR === '<=' || OPERATOR === '>' || OPERATOR === '>=') {
          orderByFieldsMandatory.push(FIELD_NAME)
        }
      }
      
      if (!lodash.isEmpty(orderBy) && lodash.isString(orderBy) && !orderByFieldsMandatory.includes(orderBy) && !hasFilterConstraint) {
        orderByFieldsMandatory.push(orderBy)
      }

      const uniqueOrderBy = [...new Set(orderByFieldsMandatory)]
      uniqueOrderBy.forEach(fieldName => {
        const fields = filter.map(el => el.field)
        
        if (fields.includes(fieldName) && fieldName == 'id') {
          hasFilterConstraint = true
          // ref = ref.orderBy(admin.firestore.FieldPath.documentId())
        } else {
          ref = ref.orderBy(fieldName, sortBy)
        }
      });

      return { ref, hasFilterConstraint }
    } catch (error) {
      throw error;
    }
  }
  
  static castValue(value) {
    if (Array.isArray(value)) {
      const values = []
      value.forEach(val => {
        if (!isNaN(val)) values.push(parseFloat(val))
        else values.push(val)
      })
      return values
    }

    if (value == 'true') return true;
    else if (value == 'false') return false;
    else if (typeof value == 'boolean') return value;
    else if (value && !isNaN(value) && !value.toString().startsWith('+')) return parseFloat(value);
    else if (typeof value == 'string') return value;
    else return null
  }

  static mapOperator(operator) {
    switch (operator) {
      case 'less': return '<';
      case 'lessEqual': return '<=';
      case 'greater': return '>';
      case 'greaterEqual': return '>=';
      case 'equal': return '==';
      case 'notEqual': return '!=';
      case 'in': return 'in';
      case 'notIn': return 'not-in';
      case 'arrayContains': return 'array-contains';
      case 'arrayContainsAny': return 'array-contains-any';
      case 'startsWith': return 'startsWith';
      case 'like': return 'like';
      default: return null
    }
  }

  static mapDateToTimeStampIfFound(filter) {
    try {
      for (const fi of filter) {
        const date = new Date(fi.value);
        if (fi.value && date instanceof Date && !isNaN(date)) {
          fi.value = admin.firestore.Timestamp.fromDate(date);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static get LESS() {
    return '<';
  }
  static get LESS_EQUAL() {
    return '<=';
  }
  static get GREATER() {
    return '>';
  }
  static get GREATER_EQUAL() {
    return '>=';
  }
  static get EQUAL() {
    return '==';
  }
  static get NOT_EQUAL() {
    return '!=';
  }
  static get IN() {
    return 'in';
  }
  static get NOT_IN() {
    return 'notIn';
  }
  static get ARRAY_CONTAINS() {
    return 'arrayContains';
  }
  static get ARRAY_CONTAINS_ANY() {
    return 'arrayContainsAny';
  }
  static get STARTS_WITH() {
    return 'startsWith';
  }
  static get LIKE() {
    return 'like';
  }
};
