import { _ } from 'lodash';

import ol from '../../libs/ol-v4.0.1-dist.js';

import {
  observedAttributes,
  attributeChangedCallback
} from './attributes';
import { defaultProjection } from '../../projections';
import logging from '../../logging';
import { getLayerFromConfig } from './layerSourceMapping';

/*global customElements, HTMLElement*/

const DEBUG = true;

const {
  log,
  logInfo,
  logWarn,
  logError
} = logging('map-layer', DEBUG);

class MapLayer extends HTMLElement {

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
    log('constructor');

    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});

    // Indicate whether this custom element is in DOM or not.
    this.connected_ = false;

    // @type {ol.layer.Base}
    this.olLayer_ = null;

    this.debouncedUpdateLayer_ = _.debounce(this.updateLayer_, 0);
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    log('connected');

    this.connected_ = true;
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    log('disconnected');

    this.connected_ = false;
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    log('attributeChanged', {attrName, oldVal, newVal});
    //!attributeChangedCallback(this, attrName, oldVal, newVal);

    // Use a debounced handler to avoid too frequent updates on consecutive attribute changes.
    this.debouncedUpdateLayer_();
  }

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback() {}

  /**
   * Getters and Setters (for properties).
   */

  get layer() {
    return this.olLayer_;
  }

  get name() {
    return this.getAttribute('name');
  }

  set name(val) {
    // Reflect the value of `name` as an attribute.
    this.setAttribute('name', name);
  }

  get type() {
    return this.getAttribute('type');
  }

  set type(val) {
    // Reflect the value of `type` as an attribute.
    this.setAttribute('type', type);
  }

  get opacity() {
    return Number(this.getAttribute('opacity'));
  }

  set opacity(val) {
    // Reflect the value of `opacity` as an attribute.
    this.setAttribute('opacity', val);
  }

  get extent() {
    return this.getAttribute('extent').split(',').map((v) => Number(v.trim()));
  }

  set extent(val) {
    // Reflect the value of `extent` as an attribute.
    switch (true) {
      case Array.isArray(val):
        this.setAttribute('extent', val.join(', '));
        break;
      default:
        this.setAttribute('extent', val);
    }
  }

  get options() {
    return JSON.parse(this.getAttribute('options'));
  }

  set options(val) {
    // Reflect the value of `options` as an attribute.
    switch (true) {
      case typeof val === 'string':
        this.setAttribute('options', val);
        break;
      default:
        this.setAttribute('options', JSON.stringify(val));
    }
  }

  /**
   * Customized public/private methods.
   */

  // Update `this.olLayer_` based on attributes.
  updateLayer_() {
    const layerConfig = {
      "id": this.name,
      "title": '', //!
      "zIndex": 0, //!
      "visible": true, //!
      "opacity": this.opacity,
      "extent": [-1, -1, -1, -1],
      "source": {
        "type": this.type,
        "options": this.options
      }
    };

    const layer = getLayerFromConfig(layerConfig),
          oldLayer = this.olLayer_,
          event = new CustomEvent('update', {
            bubbles: true,
            cancelable: false,
            scoped: false,
            composed: false,
            detail: {
              layerConfig
            }
          });

    this.olLayer_ = layer;

    const cancelled = !this.dispatchEvent(event);

    if (cancelled) {
      //! Revert the changes?
      //this.olLayer_ = oldLayer;
      //! How about other attributes?
    }

  }

}

customElements.define('map-layer', MapLayer);
