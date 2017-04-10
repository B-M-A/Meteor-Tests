/**
 * Attribute change flow:
 * - attribute on change
 * - parse attribute to property
 * - if fails
 *   - error and revert attribute to the old value
 * - else
 *   - update property (with property setter, throw if error)
 *     - fill default values
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

/*eslint no-bitwise: "off", no-console: "off"*/
/*global HTMLElement, CustomEvent, MutationObserver*/

import ol from '../../third-party/ol-v4.0.1-dist.js';

export default class HTMLMapBaseClass extends HTMLElement {

  /**
   * Lifecycle:
   * - constructor
   * - attributeChangedCallback
   * - connectedCallback
   * - (instantiate children)
   * - [attributeChangedCallback]
   * - [disconnectedCallback]
   * - [connectedCallback]
   * - [...]
   */

  static get observedAttributes () {
    // Child classes should implement this.
    return [];
  }

  /**
   * Keys are attribute names.
   * Values are property names.
   * @property {Object.<string>}
   * @readonly
   */
  static get attributeNameToPropertyNameMapping () {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are property names.
   * Values are attribute names.
   * @property {Object.<string>}
   * @readonly
   */
  static get propertyNameToAttributeNameMapping () {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are attribute names.
   * Values are functions that convert attribute configs to property values.
   * @property {Object.<isSet: boolean, val: string -> *>}
   * @readonly
   */
  static get attributeToPropertyConverters () {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are attribute names.
   * Values are functions that convert property values to attribute configs.
   * @property {Object.<* -> {isSet: boolean, value: string}>}
   * @readonly
   */
  static get propertyToAttributeConverters () {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are property names.
   * Values are functions that compare two property values and return whether they are considered identical.
   * @property {Object.<a: *, b: * -> boolean>}
   * @readonly
   */
  static get propertyComparators () {
    // Child classes should implement this.
    return {};
  }

  /**
   * string -> string
   * @private
   */
  static getPropertyNameByAttributeName_ (attrName) {
    return this.attributeNameToPropertyNameMapping[attrName] || attrName;
  }

  /**
   * string -> string
   * @private
   */
  static getAttributeNameByPropertyName_ (propName) {
    return this.propertyNameToAttributeNameMapping[propName] || propName;
  }

  // Attach the openlayers library.
  static get ol () {
    return ol;
  }

  /**
   * A better version of transformExtent.
   * @param {ol.Extent} extent
   * @param {ol.ProjectionLike} source
   * @param {ol.ProjectionLike} destination
   * @param {number} [estimation=1] - How many interpolation points used for estimation. Must be no less than 1.
   * @returns {ol.Extent}
   */
  static transformExtent (extent, source, destination, estimation = 1) {
    // Get all four points of the rectangle instead of two.
    const [minX, minY, maxX, maxY] = extent,
          _4points = [
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
          ];

    const allPoints = _4points.reduce((acc, point, index, list) => {
      // Get the next point that is needed for interpolation. Wrap around when overflow.
      const nextPoint = list[(index + 1) % list.length];
      // Get the axis where interpolation is needed. The input values are arranged so the interpolation axis iterates between 1 and 0.
      const interpolateAxis = index % 2;

      const val1 = point[interpolateAxis],
            val2 = nextPoint[interpolateAxis],
            valDiff = val2 - val1,
            pointPerEdge = estimation + 2,
            valStep = valDiff / (pointPerEdge - 1);

      const points = [];
      for (let i = 1; i <= estimation; ++i) {
        const thisPoint = [...point];
        thisPoint[interpolateAxis] = val1 + valStep * i;

        points.push(thisPoint);
      }

      return [...acc, point, ...points];
    }, []);

    const allPointsInDestination = allPoints.map((point) => this.ol.proj.transform(point, source, destination));

    // The source data used for aggregation has to contain the head again in the end to prevent overflow.
    const aggSrcData = [...allPointsInDestination, allPointsInDestination[0]];

    const aggFuncs = [
      Math.min.bind(Math),
      Math.max.bind(Math),
    ];

    const aggConfig = [
      // Order is important. It must match how `_4points` is defined.
      // For example, if `_4points[0]` and `_4points[1]` share the same Y, then the first one here must be a Y.
      'minY',
      'maxX',
      'maxY',
      'minX',
    ].map((name, index) => [name, {
      // As long as the name string array follows the order of `_4points`, these two properties don't depend on the name values.
      edgeBegin: (estimation + 1) * index,
      edgeEnd: (estimation + 1) * (index + 1) + 1,
      // This should work for the exact name value arrangement.
      // Axis X is 0, Y is 1.
      axis: 1 - index % 2,
      // This should work for the exact name value arrangement and the aggregation function arrangement.
      func: aggFuncs[(index >> 1) ^ (index & 1)]
    }]).reduce((acc, [name, config]) => ({
      ...acc,
      [name]: config
    }), {});

    const result = [
      // Result must be in the order of: minX, minY, maxX, maxY.
      aggConfig.minX,
      aggConfig.minY,
      aggConfig.maxX,
      aggConfig.maxY,
    ].map(({func, axis, edgeBegin, edgeEnd}) => func(...(aggSrcData.slice(edgeBegin, edgeEnd).map((point) => point[axis]))));

    return result;
  }

  /**
   * Returns true if the given value is a valid projection.
   * @param {ol.ProjectionLike} val
   * @returns {boolean}
   */
  static isValidProjection (val) {
    return this.ol.proj.get(val) !== null;
  }

  /**
   * NodeList -> Array.<Node>
   */
  static getArrayFromNodeList (nodeList) {
    return Array.from(nodeList);
  }

  /**
   * A static helper function for setting up observers for monitoring child element changes.
   * Does it potentially leak observers?
   * @param {HTMLElement} element
   * @param {function} constructor
   * @returns {ol.Collection.<function>}
   */
  static setupChildElementsObserver (element, constructor) {
    const collection = new this.ol.Collection(),
          updateFunction = this.updateChildElements_.bind(this, element, constructor, collection),
          observer = new MutationObserver(updateFunction);

    // Start observing.
    observer.observe(element, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });

    // If there is already children in the element, we need another pass of updating.
    if (element.children.length > 0) {
      setTimeout(updateFunction, 0);
    }

    return collection;
  }

  /**
   * Scan the children for the given elements.
   * @private
   * @param {HTMLElement} element
   * @param {function} constructor
   * @param {ol.Collection} collection
   */
  static updateChildElements_ (element, constructor, collection) {
    const childElements = this.getArrayFromNodeList(element.children).filter((node) => node instanceof HTMLElement);

    // Only scan one level. The elements in this level should handle their own children.
    const targetElements = childElements.filter((node) => node instanceof constructor);

    // Do nothing if the new elements are identical to the existing ones.
    const oldTargetElements = collection.getArray(),
          equalToOldList = targetElements.length === oldTargetElements.length && targetElements.every((el, index) => el === oldTargetElements[index]);
    if (equalToOldList) {
      return;
    }

    // Update collection.
    collection.clear();
    collection.extend(targetElements);
    collection.changed();

    element.log_(`${targetElements.length} layer(s) loaded from ${childElements.length} element(s).`);
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // Attach the openlayers library.
    this.ol = ol;

    // Indicate whether this custom element is in DOM or not.
    this.connected_ = false;

    // This namespace stores flags indicating what attributes are being changed.
    this.changingAttributes_ = {};

    // This namespace stores flags indicating if the old values of some attributes were working.
    this.hasWorkingAttributes_ = {};

    // Used by `this.setTimeout`.
    this.timeoutIDs_ = new Set();
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback () {
    this.log_('connected');
    this.connected_ = true;
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback () {
    this.log_('disconnected');

    // Clear all timers.
    this.forEachTimeoutID_((id) => {
      this.clearTimeout(id);
    });

    this.connected_ = false;
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback (attrName, oldVal, newVal) {
    // Only care about the attributes in the observed list.
    if (this.constructor.observedAttributes.indexOf(attrName) === -1) {
      return;
    }

    // If this attribute is already being updated, do not trigger a reaction again.
    if (this.isUpdating_(attrName)) {
      return;
    }

    this.log_('attributeChangedCallback', {
      attrName,
      oldVal,
      newVal
    });

    let cancelled = false;

    try {
      // Mark the attribute as being updated so changing its value during the process doesn't cause another reaction (and dead loop).
      this.setUpdateFlag_(attrName);

      const propName = this.constructor.getPropertyNameByAttributeName_(attrName),
            eventName = `changed:${propName}`,
            oldPropVal = this.getPropertyValueFromAttribute_(attrName, oldVal !== null, oldVal), //this[propName],
            newPropVal = this.getPropertyValueFromAttribute_(attrName, newVal !== null, newVal);

      if (this.isIdenticalPropertyValue_(propName, oldPropVal, newPropVal)) {
        this.log_(eventName, 'no change', {
          oldPropVal,
          newPropVal
        });
      } else {
        // Setter should verify new property value and throw if needed.
        this[propName] = newPropVal;

        this.log_(eventName, {
          oldVal: oldPropVal,
          newVal: newPropVal
        });

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
      this.logError_(`Failed to handle attribute change. ${error.message}`, {
        attrName,
        oldVal,
        newVal
      });

      //! Handle the error better?
      cancelled = true;
    } finally {
      this.clearUpdateFlag_(attrName);

      if (cancelled) {
        // Either cancelled or errored.
        if (this.hasWorkingAttributes_[attrName]) {
          // Revert the attribute to the old value.
          if (oldVal === null) {
            this.removeAttribute(attrName);
          } else {
            this.setAttribute(attrName, oldVal);
          }
        } else {
          this.logWarn_('No acceptable value to revert to.', {
            attrName,
            oldVal,
            newVal
          });
        }
      } else {
        // No error and not cancelled.
        this.hasWorkingAttributes_[attrName] = true;
      }
    }
  } // attributeChangedCallback

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback () {
    //! Not sure what to do.
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * Customized public/private methods.
   */

  log_ (...args) {
    console.log(`${this.constructor.name}_${this.id}`, ...args);
  }
  logInfo_ (...args) {
    console.info(`${this.constructor.name}_${this.id}`, ...args);
  }
  logWarn_ (...args) {
    console.warn(`${this.constructor.name}_${this.id}`, ...args);
  }
  logError_ (...args) {
    console.error(`${this.constructor.name}_${this.id}`, ...args);
  }

  /**
   * string, *, * -> boolean
   * @private
   */
  isIdenticalPropertyValue_ (propName, val1, val2) {
    const comparator = this.constructor.propertyComparators[propName];
    return comparator ? comparator(val1, val2) : false;
  }

  /**
   * Convert attribute to property.
   * @param {string} attrName
   * @param {boolean} [hasAttr] - Optional. If provided, will use this value for conversion.
   * @param {string} [attrVal] - Optional. If provided, will use this value for conversion.
   * @returns {*}
   */
  getPropertyValueFromAttribute_ (attrName, hasAttr, attrVal) {
    const _hasAttr = !(typeof hasAttr === 'undefined') ? hasAttr : this.hasAttribute(attrName);
    const _attrVal = !(typeof attrVal === 'undefined') ? attrVal : this.getAttribute(attrName);

    const converter = this.constructor.attributeToPropertyConverters[attrName];

    if (converter) {
      return converter(_hasAttr, _attrVal);
    } else {
      return _hasAttr ? _attrVal : null;
    }
  }

  /**
   * Convert property to attribute.
   * @param {string} attrName
   * @param {*} propVal
   * @returns {string}
   */
  updateAttributeByProperty_ (attrName, propVal) {
    const converter = this.constructor.propertyToAttributeConverters[attrName];

    if (converter) {
      const {
        isSet,
        value
      } = converter(propVal);

      if (isSet) {
        this.setAttribute(attrName, value);
      } else {
        this.removeAttribute(attrName);
      }
    } else {
      this.setAttribute(attrName, String(propVal));
    }

    return this.getAttribute(attrName);
  }

  // Helpers for getting/setting/clearing update flags.
  // @private
  setUpdateFlag_ (attrName) {
    this.changingAttributes_[attrName] = true;
  }
  // @private
  clearUpdateFlag_ (attrName) {
    this.changingAttributes_[attrName] = false;
  }
  // @private
  isUpdating_ (attrName) {
    return this.changingAttributes_[attrName] === true;
  }

  /**
   * Helper function for manipulating internal storage for `setTimeout`.
   */
  addTimeoutID_ (id) {
    return this.timeoutIDs_.add(id);
  }
  /**
   * Helper function for manipulating internal storage for `setTimeout`.
   */
  removeTimeoutID_ (id) {
    return this.timeoutIDs_.delete(id);
  }
  /**
   * Helper function for iterating internal storage for `setTimeout`.
   * @param {function} func
   * @param {Object|null} context
   */
  forEachTimeoutID_ (func, context) {
    this.timeoutIDs_.forEach(func, context);
  }

  /**
   * `global.setTimeout` wrapped for safety.
   * The timeouts registered with this will all be cancelled if the element is disconnected.
   * @param {function} func
   * @param {number} [delay=0]
   * @param {Array.<*>} [params]
   * @returns {number}
   */
  setTimeout (func, delay = 0, ...params) {
    const timerID = setTimeout((..._params) => {

      this.removeTimeoutID_(timerID);

      func(..._params);

    }, delay, ...params);

    this.addTimeoutID_(timerID);

    return timerID;
  }

  /**
   * `global.clearTimeout` wrapped for safety.
   * Does the reverse of `this.setTimeout`.
   * @param {number} timerID
   */
  clearTimeout (timerID) {
    clearTimeout(timerID);

    this.removeTimeoutID_(timerID);
  }

} // HTMLMapBaseClass
