const attrNameToPropNameMapping = {
  'url': 'url',
  'params': 'params',
  'server-type': 'serverType',
};
export const attrNameToPropName = (name) => {
  return attrNameToPropNameMapping[name] || name;
};
const propNameToAttrNameMapping = {
  'url': 'url',
  'params': 'params',
  'serverType': 'server-type',
};
export const propNameToAttrName = (name) => {
  return propNameToAttrNameMapping[name] || name;
};

export const attributeValueComparators = {
//   'url': 'url',
//   'params': 'params',
//   'server-type': 'serverType',
};

/**
 * For every conversion function.
 * @param {boolean} isSet
 * @param {string} val
 * @returns {*}
 */
export const attributeToPropertyConversions = {
  'url': (isSet, val) => (
    isSet
    ? val
    : undefined
  ),
  'params': (isSet, val) => (
    isSet
    ? val.split('&')
         .map((pairStr) => pairStr.split('=').map((x) => decodeURIComponent(x)))
         .reduce((acc, [key, value]) => ({...acc, [key]: value}), {})
    : {}
  ),
  'server-type': (isSet, val) => (
    isSet
    ? val
    : undefined
  ),
};

/**
 * For every conversion function.
 * @param {*} val
 * @returns {{isSet: boolean, value: string}}
 */
export const propertyToAttributeConversions = {
  'url': (val) => {
    if (val === null) {
      return {isSet: false};
    }

    if (typeof val !== 'string') {
      throw new TypeError('Layer url has to be a string.');
    }

    return {
      isSet: true,
      value: val
    };
  },
  'params': (val) => {
    if (val === null) {
      return {isSet: false};
    }

    if (typeof val !== 'object') {
      throw new TypeError('Layer params has to be an object.');
    }

    return {
      isSet: true,
      value: Object.keys(val)
             .map((key) => [key, val[key]]
                           .map((x) => encodeURIComponent(x))
                           .join('=')
                 )
             .join('&')
    };
  },
//   // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
//   'server-type'
};
