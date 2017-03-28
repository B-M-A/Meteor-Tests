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

/*global HTMLElement, CustomEvent*/

import ol from '../../libs/ol-v4.0.1-dist.js';

export default class BaseClass extends HTMLElement {

  /**
   * Lifecycle:
   * - constructor
   * - attributeChangedCallback
   * - connectedCallback
   * - [attributeChangedCallback]
   * - [disconnectedCallback]
   * - [connectedCallback]
   * - [...]
   */

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
  static get attributeToPropertyConverters() {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are attribute names.
   * Values are functions that convert property values to attribute configs.
   * @property {Object.<* -> {isSet: boolean, value: string}>}
   * @readonly
   */
  static get propertyToAttributeConverters() {
    // Child classes should implement this.
    return {};
  }

  /**
   * Keys are property names.
   * Values are functions that compare two property values and return whether they are considered identical.
   * @property {Object.<a: *, b: * -> boolean>}
   * @readonly
   */
  static get propertyComparators() {
    // Child classes should implement this.
    return {};
  }

  static get observedAttributes() {
    // Child classes should implement this.
    return [];
  }

  /**
   * string -> string
   * @private
   */
  static getPropertyNameByAttributeName_(attrName) {
    return this.attributeNameToPropertyNameMapping[attrName] || attrName;
  }

  /**
   * string -> string
   * @private
   */
  static getAttributeNameByPropertyName_(propName) {
    return this.propertyNameToAttributeNameMapping[propName] || propName;
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor() {
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
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    this.log_('connected');
    this.connected_ = true;
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    this.log_('disconnected');
    this.connected_ = false;
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    // Only care about the attributes in the observed list.
    if (this.constructor.observedAttributes.indexOf(attrName) === -1) {
      return;
    }

    // If this attribute is already being updated, do not trigger a reaction again.
    if (this.isUpdating_(attrName)) {
      return;
    }

    //!attributeChangedCallback(this, attrName, oldVal, newVal);
    let cancelled = false;

    try {
      // Mark the attribute as being updated so changing its value during the process doesn't cause another reaction (and dead loop).
      this.setUpdateFlag_(attrName);

      const propName = this.constructor.getPropertyNameByAttributeName_(attrName),
            eventName = `changed:${propName}`,
            oldPropVal = this[propName],
            newPropVal = this.getPropertyValueFromAttribute_(attrName, newVal !== null, newVal);

      if (this.isIdenticalPropertyValue_(propName, oldPropVal, newPropVal)) {
        this.log_(eventName, 'no change');
      } else {
        // Setter should verify new property value and throw if needed.
        this[propName] = newPropVal;

        this.log_(eventName, {oldVal: oldPropVal, newVal: newPropVal});

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
      this.logError_(`Failed to handle attribute change. ${error.message}`, {attrName, oldVal, newVal});

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
          this.logWarn_('No acceptable value to revert to.', {attrName, oldVal, newVal});
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
  adoptedCallback() {}

  /**
   * Getters and Setters (for properties).
   */

  /**
   * Customized public/private methods.
   */

  log_(...args) {
    console.log(this.constructor.name, ...args);
  }
  logInfo_(...args) {
    console.info(this.constructor.name, ...args);
  }
  logWarn_(...args) {
    console.warn(this.constructor.name, ...args);
  }
  logError_(...args) {
    console.error(this.constructor.name, ...args);
  }

  /**
   * string, *, * -> boolean
   * @private
   */
  isIdenticalPropertyValue_(attrName, val1, val2) {
    const comparator = this.constructor.propertyComparators[attrName];
    return comparator ? comparator(val1, val2) : false;
  }

  /**
   * Convert attribute to property.
   * @param {string} attrName
   * @param {boolean} [hasAttr] - Optional. If provided, will use this value for conversion.
   * @param {string} [attrVal] - Optional. If provided, will use this value for conversion.
   * @returns {*}
   */
  //!attrToProp_
  getPropertyValueFromAttribute_(attrName, hasAttr, attrVal) {
    if (typeof hasAttr === 'undefined') {
      hasAttr = this.hasAttribute(attrName);
    }
    if (typeof attrVal === 'undefined') {
      attrVal = this.getAttribute(attrName);
    }

    const converter = this.constructor.attributeToPropertyConverters[attrName];

    return converter ? converter(hasAttr, attrVal) : (hasAttr ? attrVal : null);
  }

  /**
   * Convert property to attribute.
   * @param {string} attrName
   * @param {*} propVal
   * @returns {string}
   */
  //!propToAttr_
  updateAttributeByProperty_(attrName, propVal) {
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
  setUpdateFlag_(attrName) {
    this.changingAttributes_[attrName] = true;
  }
  // @private
  clearUpdateFlag_(attrName) {
    this.changingAttributes_[attrName] = false;
  }
  // @private
  isUpdating_(attrName) {
    return this.changingAttributes_[attrName] === true;
  }

}
