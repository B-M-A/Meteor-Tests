// @type {number}
const defaultOpacity = 1;

export const attributeValueComparators = {
  'name': (a, b) => a === b || String(a).trim() === String(b).trim(),
//   'opacity': 'opacity',
//   'extent': 'extent',
};

/**
 * For every conversion function.
 * @param {boolean} isSet
 * @param {string} val
 * @returns {*}
 */
export const attributeToPropertyConversions = {
  'name': (isSet, val) => (
    isSet
    ? val
    : undefined
  ),
  'opacity': (isSet, val) => (
    isSet
    ? parseFloat(val)
    : defaultOpacity
  ),
  'extent': (isSet, val) => (
    isSet
    ? val.split(',')
        .map(v => v.trim())
        .map(v => parseFloat(v))
    : null
  ),
};

/**
 * For every conversion function.
 * @param {*} val
 * @returns {{isSet: boolean, value: string}}
 */
export const propertyToAttributeConversions = {
  // @param {string|null} val - String value to be set, null to unset.
  'name': (val) => {
    if (val === null) {
      return {isSet: false};
    }

    if (typeof val !== 'string') {
      throw new TypeError('Layer name has to be a string.');
    }

    return {
      isSet: true,
      value: val
    };
  },
  // @param {number|null} val - Number value to be set, null to unset.
  'opacity': (val) => {
    if (val === null) {
      return {isSet: false};
    }

    if (typeof val !== 'number') {
      throw new TypeError('Layer opacity has to be a number.');
    }

    return {
      isSet: true,
      value: String(val)
    };
  },
  // @param {Array.<number>|null} val - Array of 4 numbers value to be set, null to unset.
  'extent': (val) => {
    if (val === null) {
      return {isSet: false};
    }

    if (!(Array.isArray(val) && val.every(x => typeof x === 'number') && val.length === 4)) {
      throw new TypeError('Layer extent has to be an array of 4 numbers.');
    }

    return {
      isSet: true,
      value: val.join(', ')
    };
  },
};
