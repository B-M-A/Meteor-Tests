import ol from './libs/ol-v4.0.1-dist.js';

import {
  observedAttributes,
  attributeChangedCallback
} from './attributes.js';
import { defaultProjection } from './projections.js';
import { getView } from './view.js';
import { html as shadowRootHTML } from './template.js';
import { getBaseMap } from './basemap.js';

/*global customElements, HTMLElement*/

const DEBUG = true,
      NOOP = () => {},
      log = DEBUG ? ((...args) => console.log(...args)) : NOOP,
      logInfo = DEBUG ? ((...args) => console.info(...args)) : NOOP,
      logWarn = DEBUG ? ((...args) => console.warn(...args)) : NOOP,
      logError = DEBUG ? ((...args) => console.error(...args)) : NOOP;

/**
 * Returns a map of attribute names to their values.
 */
const getElementAttributes = (element) => {
  const attrs = {};
  if (element.hasAttributes()) {
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      attrs[element.attributes[i].name] = element.attributes[i].value;
    }
  }
  return attrs;
};


class MapView extends HTMLElement {

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

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = shadowRootHTML;

    this.mapElement_ = shadowRoot.querySelector('#map');

    // Indicate whether this custom element is in DOM or not.
    this.connected_ = false;

    // Some caching stores.
    this.baseMapCache_ = {};
    this.viewCache_ = {};

    // Controls are tied to the map view.
    this.mapControls_ = new ol.Collection();

    // Overlays are tied to geolocations.
    this.mapOverlays_ = new ol.Collection();

    this.mapInteractions_ = new ol.Collection();

    this.baseMapLayerCollection_ = new ol.Collection([
      getBaseMap(this.basemap, this.baseMapCache_)
    ].filter(Boolean) /* Get rid of any null values that may piss Openlayers */);

    // Stores the active ol.View.
    this.mapView_ = getView(this.projection, this.viewCache_);

    this.olMap_ = new ol.Map({
      controls: this.mapControls_,
      interactions: this.mapInteractions_,
      keyboardEventTarget: this.mapElement_,
      layers: [
        new ol.layer.Group({
          opacity: 1,
          visible: 1,
          //extent:
          zIndex: 0,
          layers: this.baseMapLayerCollection_
        })
      ],
      loadTilesWhileAnimating: false,
      loadTilesWhileInteracting: false,
      logo: false,
      overlays: this.mapOverlays_,
      renderer: 'canvas',
      target: this.mapElement_,
      view: null
    });
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    log('connected');

    this.connected_ = true;

    // Reconnect the view.
    this.olMap_.setView(this.mapView_);

    // After this custom element is inserted into somewhere new, the map size has to be updated.
    this.olMap_.updateSize();
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    log('disconnected');

    this.connected_ = false;

    // Disconnect the view.
    this.olMap_.setView(null);
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    logWarn('attributeChanged', {attrName, oldVal, newVal});
    attributeChangedCallback(this, attrName, oldVal, newVal);
  }

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback() {}

  /**
   * Getters and Setters (for properties).
   */

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    // Reflect the value of `disabled` as an attribute.
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get basemap() {
    return this.getAttribute('basemap') || '';
  }

  set basemap(val) {
    // Reflect the value of `disabled` as an attribute.
    if (val) {
      this.setAttribute('basemap', val);
    } else {
      this.removeAttribute('basemap');
    }
  }

  get projection() {
    return this.getAttribute('projection') || defaultProjection;
  }

  set projection(val) {
    // Reflect the value of `disabled` as an attribute.
    if (val) {
      this.setAttribute('projection', val);
    } else {
      this.removeAttribute('projection');
    }
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Underlying function that actually changes the base map.
   */
  setBaseMap_(type) {
    log('setBaseMap_', {type});

    // @type {ol.layer.Base|null}
    const newBaseLayer = getBaseMap(type, this.baseMapCache_);

    this.baseMapLayerCollection_.clear();

    if (newBaseLayer) {
      this.baseMapLayerCollection_.push(newBaseLayer);
    } else {
      throw new RangeError('Invalid base map type.');
    }
  }

  /**
   * Underlying function that actually changes the projection.
   */
  setProjection_(projection) {
    log('setProjection_', {projection});

    // @type {ol.View|null}
    const newView = getView(projection, this.viewCache_);

    if (newView) {
      this.mapView_ = newView;
      if (this.connected_) {
        this.olMap_.setView(this.mapView_);
      }
    } else {
      throw new RangeError('Invalid projection.');
    }
  }

}

customElements.define('map-view', MapView);
