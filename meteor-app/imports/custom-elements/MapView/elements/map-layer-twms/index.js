import { _ } from 'lodash';

import HTMLMapLayerBase from '/imports/custom-elements/MapView/elements/map-layer-base';

import ol from '../../libs/ol-v4.0.1-dist.js';

import {
  observedAttributes,
  attrToProp,
  propToAttr,
  attrNameToPropName,
  propNameToAttrName,
  attributeChangedCallback,
} from './attributes';
import { defaultProjection } from '../../projections';
import logging from '../../logging';

/*global customElements, HTMLElement*/

const DEBUG = true;

const {
  log,
  logInfo,
  logWarn,
  logError
} = logging('map-layer-twms', DEBUG);

const self = class HTMLMapLayerTWMS extends HTMLMapLayerBase {

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
    return super.observedAttributes.concat(observedAttributes);
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

    // @type {ol.source.Source}
    this.olSource_ = /*null*/ new ol.source.TileWMS();

    // @type {ol.layer.Base}
    this.olLayer_ = /*null*/ new ol.layer.Tile({
      source: this.olSource_
    });

    // This namespace stores flags indicating what attributes are being changed.
    this.changingAttributes_ = {};

    //this.debouncedUpdateLayer_ = _.debounce(this.updateLayer_, 0);
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    log('connected');

    super.connectedCallback();

    this.updateLayer_();
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    log('disconnected');

    super.disconnectedCallback();

    //!
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    super.attributeChangedCallback(attrName, oldVal, newVal);

    // Only care about the attributes in the observed list.
    if (observedAttributes.indexOf(attrName) === -1) {
      return;
    }

    // If this attribute is already being updated, do not trigger a reaction again.
    if (this.changingAttributes_[attrName]) {
      log('attribute change suppressed', {attrName, oldVal, newVal});
      return;
    }

    log('attribute changed', {attrName, oldVal, newVal});

    attributeChangedCallback(this, attrName, oldVal, newVal);
  }

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback() {
    super.adoptedCallback();
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {string} url
  get url() {
    return attrToProp(this, propNameToAttrName('url'));
  }
  set url(val) {
    propToAttr(this, propNameToAttrName('url'), val);

    // Update internal models.
    this.olSource_.setUrl(val);
  }

  // @property {Object} params
  get params() {
    return attrToProp(this, propNameToAttrName('params'));
  }
  set params(val) {
    propToAttr(this, propNameToAttrName('params'), val);

    // Update internal models.
    this.olSource_.updateParams(val);
  }

  /**
   * Customized public/private methods.
   */

  // Update `this.olLayer_` based on attributes.
  updateLayer_() {
    // Do nothing if the element is not connected.
    if (!this.connected_) {
      return;
    }


//     const layerConfig = {
//       "id": this.name,
//       "title": '', //!
//       "zIndex": 0, //!
//       "visible": true, //!
//       "opacity": this.opacity,
//       "extent": [-1, -1, -1, -1],
//       "source": {
//         "type": this.type,
//         "options": this.options
//       }
//     };
//
//     const layer = getLayerFromConfig(layerConfig),
//           oldLayer = this.olLayer_,
//           event = new CustomEvent('update', {
//             bubbles: true,
//             cancelable: false,
//             scoped: false,
//             composed: false,
//             detail: {
//               layerConfig
//             }
//           });
//
//     this.olLayer_ = layer;
//
//     const cancelled = !this.dispatchEvent(event);
//
//     if (cancelled) {
//       //! Revert the changes?
//       //this.olLayer_ = oldLayer;
//       //! How about other attributes?
//     }

  }

}

customElements.define('map-layer-twms', self);

export default self;
