import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import BaseClass from '../base';

import HTMLMapLayerBase from '../map-layer-base';

import {
  defaultProjection,
} from '../../projections';
import {
  defaultCenter,
  getView,
} from '../../view.js';
import {
  html as shadowRootHTML,
} from '../../template';
import {
  defaultMapType,
  getBaseMap,
} from '../../basemap';

/*global customElements, HTMLElement, MutationObserver*/

/**
 * Returns a map of attribute names to their values.
 */
// const getElementAttributes = (element) => {
//   const attrs = {};
//   if (element.hasAttributes()) {
//     for (let i = element.attributes.length - 1; i >= 0; i--) {
//       attrs[element.attributes[i].name] = element.attributes[i].value;
//     }
//   }
//   return attrs;
// };

/**
 * NodeList -> Array.<Node>
 */
const getArrayFromNodeList = (nodeList) => Array.from(nodeList);

export default class HTMLMapView extends BaseClass {

  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'disabled': 'disabled',
      'basemap': 'basemap',
      'projection': 'projection',
      'center': 'center',
    });
  }

  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'disabled': 'disabled',
      'basemap': 'basemap',
      'projection': 'projection',
      'center': 'center',
    });
  }

  static get attributeToPropertyConverters() {
    return _.merge({}, super.attributeToPropertyConverters, {
      'disabled': (isSet, val) => (
        isSet
        ? true
        : false
      ),
      'basemap': (isSet, val) => (
        isSet
        ? val.trim()
        : null
      ),
      'projection': (isSet, val) => (
        isSet
        ? val.trim()
        : null
      ),
      'center': (isSet, val) => (
        isSet
        ? val.split(',')
            .map(v => v.trim())
            .map(v => parseFloat(v))
        : null
      ),
    });
  }

  static get propertyToAttributeConverters() {
    return _.merge({}, super.propertyToAttributeConverters, {
      // @param {boolean|null} val - Boolean value to set or unset, null to unset.
      'disabled': (val) => ({
          isSet: Boolean(val),
          value: 'disabled',
      }),
      'basemap': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      'projection': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      'center': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val.join(', '),
      }),
    });
  }

  static get propertyComparators() {
    return _.merge({}, super.propertyComparators, {
//       'disabled': 'disabled',
//       'basemap': 'basemap',
//       'projection': 'projection',
//       'center': 'center',
    });
  }

  static get observedAttributes() {
    return _.concat(super.observedAttributes, [
      'disabled',
      'basemap',
      'projection',
      'center',
      'test', //!
    ]);
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor() {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    const {
      ol
    } = this;

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = shadowRootHTML;

    // Get references to all elements here.
    this.mapElement_ = shadowRoot.querySelector('#map');
    this.layerList_ = shadowRoot.querySelector('#layer-list');

    // Some caching stores.
    this.baseMapCache_ = {};
    this.viewCache_ = {};

    // Controls are tied to the map view.
    this.mapControls_ = new ol.Collection();

    // Overlays are tied to geolocations.
    this.mapOverlays_ = new ol.Collection();

    this.mapInteractions_ = new ol.Collection();

    this.childMapLayerElementCollection_ = new ol.Collection();
    this.childMapLayerCollection_ = new ol.Collection();

    // Sync from element collection to layer collection.
    this.childMapLayerElementCollection_.on('change', () => {
      const layers = this.childMapLayerElementCollection_.getArray().map(element => element.layer);

      this.childMapLayerCollection_.clear();
      this.childMapLayerCollection_.extend(layers);
    });

    this.baseMapLayerCollection_ = new ol.Collection([
      getBaseMap(defaultMapType, this.baseMapCache_)
    ]);

    // Stores the active ol.View.
    this.mapView_ = getView(defaultProjection, this.viewCache_);

    this.olMap_ = new ol.Map({
      //controls: this.mapControls_,
      //interactions: this.mapInteractions_,
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
        //!
        new ol.layer.Vector({
          source: new ol.source.Vector({
            url: 'https://openlayers.org/en/v4.0.1/examples/data/geojson/countries.geojson',
            format: new ol.format.GeoJSON()
          }),
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


    //! Test default property values.
    this.logInfo_({
      disabled: this.disabled,
      basemap: this.basemap,
      projection: this.projection,
      center: this.center,
    });
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    super.connectedCallback();

    //!log('getElementAttributes', getElementAttributes(this));

    // Reconnect the view.
    this.mountView_();

    // After this custom element is inserted into somewhere new, the map size has to be updated.
    this.olMap_.updateSize();
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {
    super.disconnectedCallback();

    // Disconnect the view.
    this.unmountView_();
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {boolean} disabled
  get disabled() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('disabled'));
  }
  set disabled(val) {
    if (!typeCheck('Boolean | Null', val)) {
      throw new TypeError('Disabled has to be a boolean value.');
    }

    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('disabled'), val);
  }

  // @property {string} basemap
  get basemap() {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('basemap'));
    return propValFromAttr === null ? defaultMapType : propValFromAttr;
  }
  set basemap(val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map view base map type has to be a string.');
    }

    if (typeCheck('String', val)) {
      val = val.trim();
    }

    // Update internal models.
    const layer = getBaseMap(val, this.baseMapCache_);

    this.baseMapLayerCollection_.clear();
    if (layer === null) {
      throw new TypeError('Invalid base map type.');
    } else {
      this.baseMapLayerCollection_.push(layer);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('basemap'), val);
  }

  // @property {string} projection
  get projection() {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('projection'));
    return propValFromAttr === null ? defaultProjection : propValFromAttr;
  }
  set projection(val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map projection has to be a string.');
    }

    if (typeCheck('String', val)) {
      val = val.trim();
    }

    // Update internal models.

    // @type {ol.View|null}
    const newView = getView(val, this.viewCache_);

    if (newView === null) {
      throw new TypeError('Invalid projection.');
    } else {
      const oldProj = this.mapView_.getProjection(),
            newProj = newView.getProjection(),
            oldCenter = this.mapView_.getCenter(),
            newCenter = this.ol.proj.transform(oldCenter, oldProj, newProj);

      // Update layer coordinates.
      this.childMapLayerElementCollection_.forEach((element) => {
        const oldExtent = element.extent;

        if (oldExtent !== null) {
          const newExtent = this.ol.proj.transformExtent(oldExtent, oldProj, newProj);
          element.extent = newExtent;
        }
      });

      this.center = newCenter;
      this.mapView_ = newView;

      if (this.connected_) {
        this.mountView_();
      }
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('projection'), val);
  }

  get center() {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('center'));
    return propValFromAttr === null ? defaultCenter : propValFromAttr;
  }
  set center(val) {
    if (!typeCheck('(Number, Number) | Null', val)) {
      throw new TypeError('Map view center has to be an array of 2 numbers.');
    }

    // Update internal models.
    this.mapView_.setCenter(val);

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('center'), val);
  }

  //! Property for testing event loop.
  set test(val) {

  }

  /**
   * Customized public/private methods.
   */

  mountView_() {
    this.log_('mountView_');

    this.mapView_.setCenter(this.center);
    this.olMap_.setView(this.mapView_);
  }
  unmountView_() {
    this.log_('unmountView_');

    this.olMap_.setView(null);
  }

  updateLayers_() {
    this.log_('updateLayers_');

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

    this.childMapLayerElementCollection_.clear();
    this.childMapLayerElementCollection_.extend(layerElements);
    this.childMapLayerElementCollection_.changed();

    this.log_(`${layerElements.length} layer(s) loaded.`);
  } // updateLayers_

} // HTMLMapView

customElements.define('map-view', HTMLMapView);
