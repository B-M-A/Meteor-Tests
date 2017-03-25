import ol from '../../libs/ol-v4.0.1-dist.js';

import {
  defaultMapType,
  getBaseMap
} from '../../basemap.js';
import {
  defaultProjection
} from '../../projections';
import {
  defaultCenterString,
  getView
} from '../../view';
import logging from '../../logging';

const DEBUG = true;

const {
  log,
  logInfo,
  logWarn,
  logError
} = logging('map-view', DEBUG);

export const observedAttributes = [
  'disabled',
  'basemap',
  'projection',
  'center',
  'test',
];

/**
 * For every handler function.
 * @param {HTMLElement} context
 * @param {string|null} oldVal
 * @param {string|null} newVal
 */
const attributeChangeHandlers = {
  'basemap': (context, oldVal, newVal) => {
    log('changed:basemap', {oldVal, newVal});

    if (oldVal === newVal) {
      log('setBaseMap_', 'no change');
      return;
    }

    const newType = attrToProp(context, 'basemap', newVal !== null, newVal);

    // @type {ol.layer.Base|null}
    const newBaseLayer = getBaseMap(newType, context.baseMapCache_);

    context.baseMapLayerCollection_.clear();

    if (newBaseLayer) {
      context.baseMapLayerCollection_.push(newBaseLayer);
    } else {
      throw new RangeError('Invalid base map type.');
    }
  },
  'projection': (context, oldVal, newVal) => {
    log('changed:projection', {oldVal, newVal});

    if (oldVal === newVal) {
      log('changed:projection', 'no change');
      return;
    }

    // Projection is switching from one to the other. So we need to transform all coordinates.
    const oldProj = attrToProp(context, 'projection', oldVal !== null, oldVal),
          newProj = attrToProp(context, 'projection', newVal !== null, newVal);

    log('changed:projection', {oldProj, newProj});

    const oldCenter = context.center,
          newCenter = ol.proj.transform(oldCenter, oldProj, newProj);
    context.center = newCenter;

    // @type {ol.View|null}
    const newView = getView(newVal, context.viewCache_);

    if (newView) {
      context.view = newView;

      if (context.connected_) {
        context.mountView_();
      }
    } else {
      throw new RangeError('Invalid projection.');
    }
  },
  'center': (context, oldVal, newVal) => {
    log('changed:center', {oldVal, newVal});

    if (oldVal === newVal) {
      log('changed:center', 'no change');
      return;
    }

    const newCenter = attrToProp(context, 'center', newVal !== null, newVal);

    context.view.setCenter(newCenter);
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
      value: val instanceof ol.proj.Projection ? val.getCode() : String(val)
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

  if (!handler) {
    return null;
  }

  try {
    context.respondingAttributeChanges_ = true;

    const result = handler(context, oldVal, newVal);

    context.respondingAttributeChanges_ = false;

    return result;
  } catch (error) {
    //! Handle the error better?
    context.respondingAttributeChanges_ = false;
    logError(`Failed to handle attribute change. ${error.message}`);
  }
};
