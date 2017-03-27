import ol from '../../libs/ol-v4.0.1-dist.js';

import HTMLMapLayerBase from '../map-layer-base';

import {
  observedAttributes,
  attrToProp,
  propToAttr,
  attributeChangedCallback
} from './attributes';
import { getView } from '../../view.js';
import { html as shadowRootHTML } from '../../template';
import { getBaseMap } from '../../basemap';
import logging from '../../logging';

/*global customElements, HTMLElement*/

const DEBUG = true;

const {
  log,
  logInfo,
  logWarn,
  logError
} = logging('map-view', DEBUG);

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

/**
 * NodeList -> Array.<Node>
 */
const getArrayFromNodeList = (nodeList) => Array.from(nodeList);

const self = class HTMLMapView extends HTMLElement {

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
    shadowRoot.innerHTML = shadowRootHTML;

    // Get references to all elements here.
    this.mapElement_ = shadowRoot.querySelector('#map');
    this.layerList_ = shadowRoot.querySelector('#layer-list');

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

    this.childMapLayerCollection_ = new ol.Collection();

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
        }),
        new ol.layer.Group({
          opacity: 1,
          visible: 1,
          //extent:
          zIndex: 1,
          layers: this.childMapLayerCollection_
        }),
      ],
      loadTilesWhileAnimating: false,
      loadTilesWhileInteracting: false,
      logo: false,
      overlays: this.mapOverlays_,
      renderer: 'canvas',
      target: this.mapElement_,
      view: null
    });

    this.contentMutationObserver_ = new MutationObserver((mutations) => {
      let addedElements = [],
          removedElements = [];

      mutations.forEach((mutation) => {
        const {
          addedNodes,
          removedNodes,
        } = mutation;

        addedElements = addedElements.concat(getArrayFromNodeList(addedNodes).filter(node => node instanceof HTMLElement));
        removedElements = removedElements.concat(getArrayFromNodeList(removedNodes).filter(node => node instanceof HTMLElement));
      });

      console.info('mutation', {addedElements, removedElements});

      // Scan sub-level for layers.
      this.updateLayers_();
    });

    this.contentMutationObserverConfig_ = {
      attributes: true,
      childList: true,
      characterData: false,
      subtree: true
    };

    this.contentMutationObserver_.observe(this, this.contentMutationObserverConfig_);
    //this.layerListMutationObserver_.disconnect();

  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    log('connected');

    log('this.children', this.children);
    //!log('getElementAttributes', getElementAttributes(this));

    this.connected_ = true;

    // Reconnect the view.
    this.mountView_();

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
    this.unmountView_();
  }

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {
    log('attributeChanged', {attrName, oldVal, newVal});
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
    return attrToProp(this, 'disabled');
  }

  set disabled(val) {
    // Reflect the value of `disabled` as an attribute.
    propToAttr(this, 'disabled', val);
  }

  get basemap() {
    return attrToProp(this, 'basemap');
  }

  set basemap(val) {
    // Reflect the value of `basemap` as an attribute.
    propToAttr(this, 'basemap', val);
  }

  get projection() {
    return attrToProp(this, 'projection');
  }

  set projection(val) {
    // Reflect the value of `projection` as an attribute.
    propToAttr(this, 'projection', val);
  }

  get center() {
    return attrToProp(this, 'center');
  }

  set center(val) {
    // Reflect the value of `center` as an attribute.
    propToAttr(this, 'center', val);
  }

  get view() {
    return this.mapView_;
  }

  set view(val) {
    //! Validate view.
    this.mapView_ = val;
    this.center = val.getCenter();
    this.projection = val.getProjection();

    if (this.connected_) {
      this.mountView_();
    }
  }

  //! Property for testing event loop.
  set test(val) {

  }

  /**
   * Customized public/private methods.
   */

  mountView_() {
    log('mountView_');

    this.mapView_.setCenter(this.center);
    this.olMap_.setView(this.mapView_);
  }
  unmountView_() {
    log('unmountView_');

    this.olMap_.setView(null);
  }

  updateLayers_() {
    log('updateLayers_');

    const layerElements = [];

    // DFS all the layer elements.
    let dfsStack = [this];
    while (dfsStack.length > 0) {
      const thisElement = dfsStack.pop();

      if (thisElement instanceof HTMLMapLayerBase) {
        layerElements.push(thisElement);
      } else {
        const childElements = getArrayFromNodeList(thisElement.children).filter(node => node instanceof HTMLElement);
        dfsStack = dfsStack.concat(childElements.reverse());
      }
    }

    const layers = layerElements.map(element => element.layer);

    this.childMapLayerCollection_.clear();
    this.childMapLayerCollection_.extend(layers);
  }

}

customElements.define('map-view', self);

export default self;
