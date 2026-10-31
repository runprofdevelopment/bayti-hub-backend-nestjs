const lodash = require('lodash');
const assert = require('assert');
const String = require('./string');

module.exports = class StringArray {
  constructor() {}

  /**
   * Validate the field data
   * @param {String} fieldName 
   * @param {String} data 
   * @returns 
   */
   validate(fieldName, data) {
    if (!data) {
      return;
    }

    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isArray(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type Array; Array cannot represent a non array value: ${data}`);
    data.forEach((item, index) => new String().validate(`${fieldName}[${index}]`, item));
  }

  cast(data) {
    if (!data) {
      return [];
    }

    return data;
  }
};
