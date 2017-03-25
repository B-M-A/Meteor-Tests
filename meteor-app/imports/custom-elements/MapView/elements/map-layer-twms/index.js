import { _ } from 'lodash';

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

const defaultOpacity = 1;

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

    // Attach the openlayers library.
    this.ol = ol;

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});

    // Indicate whether this custom element is in DOM or not.
    this.connected_ = false;

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

    this.connected_ = true;

    this.updateLayer_();
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

customElements.define('map-layer-twms', MapLayer);
