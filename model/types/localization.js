const lodash = require('lodash');
const assert = require('assert');
// const uuid = require('uuid');
// const { v4: uuid } = require('uuid/v4');
// const admin = require('firebase-admin');

module.exports = class Localization {
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
    assert(lodash.isObject(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type JSON; JSON cannot represent a non json value: ${data}`);

    if (data.en) {
      assert(lodash.isString(data.en), `Variable ${fieldName}.en got invalid value ${data.en}; Expected type String; String cannot represent a non string value: ${data.en}`);
    }

    if (data.ar) {
      assert(lodash.isString(data.ar), `Variable ${fieldName}.ar got invalid value ${data.ar}; Expected type String; String cannot represent a non string value: ${data.ar}`);
    }
  }

  cast(data) {
    return data 
      ? {
          en: data.en || null,
          ar: data.ar || null,
        } 
      : {
          en: null,
          ar: null,
        };
  }
};