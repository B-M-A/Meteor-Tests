import ol from '../../libs/ol-v4.0.1-dist.js';

import {
  observedAttributes,
  attrToProp,
  propToAttr,
  propNameToAttrName,
  attributeChangedCallback,
} from './attributes';

const self = class HTMLMapLayerBase extends HTMLElement {

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

  static get observedAttributes() {
    return observedAttributes;
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

    // @type {ol.layer.Base}
    this.olLayer_ = null;

    // This namespace stores flags indicating what attributes are being changed.
    this.changingAttributes_ = {};
  }

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    this.connected_ = true;
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    this.connected_ = false;
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    // Only care about the attributes in the observed list.
    if (observedAttributes.indexOf(attrName) === -1) {
      return;
    }

    // If this attribute is already being updated, do not trigger a reaction again.
    if (this.changingAttributes_[attrName]) {
      return;
    }
    attributeChangedCallback(this, attrName, oldVal, newVal);
  }

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback() {}

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.layer.Base} layer
  // @readonly
  get layer() {
    return this.olLayer_;
  }

  // @property {string} name
  get name() {
    return attrToProp(this, propNameToAttrName('name'));
  }
  set name(val) {
    propToAttr(this, propNameToAttrName('name'), val);

    // Update internal models.
    this.olLayer_.set('name', val);
  }

  // @property {number} opacity
  get opacity() {
    return attrToProp(this, propNameToAttrName('opacity'));
  }
  set opacity(val) {
    propToAttr(this, propNameToAttrName('opacity'), val);

    // Update internal models.
    this.olLayer_.setOpacity(val);
  }

  // @property {Array.<number>} extent
  get extent() {
    return attrToProp(this, propNameToAttrName('extent'));
  }
  set extent(val) {
    propToAttr(this, propNameToAttrName('extent'), val);

    // Update internal models.
    this.olLayer_.setExtent(val);
  }
}

export default self;
