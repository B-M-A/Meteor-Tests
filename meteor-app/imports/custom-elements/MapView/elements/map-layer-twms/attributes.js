/**
 * Attribute change flow:
 * - attribute on change
 * - parse attribute to property
 * - if fails
 *   - error and revert attribute to the old value
 * - else
 *   - update property (with property setter, throw if error)
 *     - verify new property
 *     - update internal models
 *     - silent update attribute with new property
 *   - if fails
 *     - error and revert attribute to the old value
 *   - else
 *     - dispatch change event
 *     - if canceled
 *       - revert attribute to the old value
 *     - else
 *       - done!
 */

import logging from '../../logging';

const DEBUG = true;

const {
  log,
  logInfo,
  logWarn,
  logError
} = logging('map-layer-twms', DEBUG);

export const observedAttributes = [
  // Unique name for the layer.
  'name',
  // Opacity of the layer.
  'opacity',
  // Extent of the layer.
  'extent',

  // Url of the layer source.
  'url',
  // WMS request parameters formatted as a query string: Name1=Value1&Name2=Value2 (names and values require escaping)
  // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
  'params',
  // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
  'server-type'
];

const attrNameToPropNameMapping = {
  'name': 'name',
  'opacity': 'opacity',
  'extent': 'extent',
  'url': 'url',
  'params': 'params',
  'server-type': 'serverType',
};
export const attrNameToPropName = (name) => {
  return attrNameToPropNameMapping[name] || name;
};
const propNameToAttrNameMapping = {
  'name': 'name',
  'opacity': 'opacity',
  'extent': 'extent',
  'url': 'url',
  'params': 'params',
  'serverType': 'server-type',
};
export const propNameToAttrName = (name) => {
  return propNameToAttrNameMapping[name] || name;
};

const attributeValueComparators = {
  'name': (a, b) => a === b || String(a).trim() === String(b).trim(),
//   'opacity': 'opacity',
//   'extent': 'extent',
//   'url': 'url',
//   'params': 'params',
//   'server-type': 'serverType',
};
const isIdenticalAttributeValue = (attrName, val1, val2) => {
  const comparator = attributeValueComparators[attrName];
  return comparator ? comparator(val1, val2) : false;
};

// @type {number}
const defaultOpacity = 1;

/**
 * For every conversion function.
 * @param {boolean} isSet
 * @param {string} val
 * @returns {*}
 */
const attributeToPropertyConversions = {
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
const propertyToAttributeConversions = {
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
  let cancelled = false;

  try {
    // Mark the attribute as being updated so changing its value during the process doesn't cause another reaction (and dead loop).
    context.changingAttributes_[attrName] = true;

    const propName = attrNameToPropName(attrName),
          eventName = `changed:${propName}`;

    if (isIdenticalAttributeValue(attrName, oldVal, newVal)) {
      log(eventName, 'no change');
    } else {
      // Attribute-to-property conversion function should verify attribute value and throw if needed.
      const newPropVal = attrToProp(context, attrName, newVal !== null, newVal);
      const oldPropVal = context[propName];

      // Setter should verify new property value and throw if needed.
      context[propName] = newPropVal;

      log(eventName, {oldVal: oldPropVal, newVal: newPropVal});

      // Dispatch change event.
      const event = new CustomEvent(eventName, {
        bubbles: true,
        cancelable: true,
        scoped: false,
        composed: false,
        detail: {
          property: propName,
          newValue: newPropVal
        }
      });

      cancelled = !this.dispatchEvent(event);
    }
  } catch (error) {
    logError(`Failed to handle attribute change. ${error.message}`, {attrName, oldVal, newVal});

    //! Handle the error better?
    cancelled = true;
  } finally {
    context.changingAttributes_[attrName] = false;

    if (cancelled) {
      // Revert the attribute to the old value.
      if (oldVal === null) {
        context.removeAttribute(attrName);
      } else {
        context.setAttribute(attrName, oldVal);
      }
    }
  }
};
