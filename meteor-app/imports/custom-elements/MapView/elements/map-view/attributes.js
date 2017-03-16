import {
  defaultMapType,
  getBaseMap
} from '../../basemap.js';
import {
  defaultProjection
} from '../../projections';
import {
  defaultCenterString
} from '../../view';

export const observedAttributes = [
  'disabled',
  'basemap',
  'projection',
  'center'
];

const attributeChangeHandlers = {
  'basemap': (context, oldVal, newVal) => {
    context.setBaseMap_(oldVal, newVal);
  },
  'projection': (context, oldVal, newVal) => {
    context.setProjection_(oldVal, newVal);
  },
  'center': (context, oldVal, newVal) => {
    context.setCenter_(oldVal, newVal);
  },
};

/**
 * For every conversion function.
 * @param {boolean} isSet
 * @param {string} val
 * @returns {*}
 */
const attributeToPropertyConversions = {
  'disabled': (isSet, val) => {
    return isSet;
  },
  'basemap': (isSet, val) => {
    return isSet ? val : defaultMapType;
  },
  'projection': (isSet, val) => {
    return isSet ? val : defaultProjection;
  },
  'center': (isSet, val) => {
    return (isSet ? val : defaultCenterString).split(',').map((v) => Number(v.trim()));
  },
};

/**
 * For every conversion function.
 * @param {*} val
 * @returns {{isSet: boolean, value: string}}
 */
const propertyToAttributeConversions = {
  'disabled': (val) => {
    const disabled = Boolean(val);
    return {
      isSet: disabled,
      value: ''
    };
  },
  'basemap': (val) => {
    return {
      isSet: val !== null,
      value: String(val)
    };
  },
  'projection': (val) => {
    return {
      isSet: val !== null,
      value: String(val)
    };
  },
  'center': (val) => {
    return {
      isSet: val !== null,
      value: Array.isArray(val) ? val.join(', ') : String(val)
    };
  },
};

/**
 * Convert attribute to property.
 * @param {HTMLElement} context
 * @param {string} attrName
 * @param {boolean} [hasAttr] - Optional. If provided, will use this value for conversion.
 * @param {string} [attrVal] - Optional. If provided, will use this value for conversion.
 * @returns {*}
 */
export const attrToProp = (context, attrName, hasAttr, attrVal) => {
  if (typeof hasAttr === 'undefined') {
    hasAttr = context.hasAttribute(attrName);
  }
  if (typeof attrVal === 'undefined') {
    attrVal = context.getAttribute(attrName);
  }

  const converter = attributeToPropertyConversions[attrName];

  return converter ? converter(hasAttr, attrVal) : (hasAttr ? attrVal : null);
};

/**
 * Convert property to attribute.
 * @param {HTMLElement} context
 * @param {string} attrName
 * @param {*} propVal
 * @returns {string}
 */
export const propToAttr = (context, attrName, propVal) => {
  const converter = propertyToAttributeConversions[attrName];

  if (converter) {
    const {
      isSet,
      value
    } = converter(propVal);

    if (isSet) {
      context.setAttribute(attrName, value);
    } else {
      context.removeAttribute(attrName);
    }
  } else {
    context.setAttribute(attrName, String(propVal));
  }

  return context.getAttribute(attrName);
};

export const attributeChangedCallback = (context, attrName, oldVal, newVal) => {
  const handler = attributeChangeHandlers[attrName];
  return handler ? handler(context, oldVal, newVal) : null;
};
