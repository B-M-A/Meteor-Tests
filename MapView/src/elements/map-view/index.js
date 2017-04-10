import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import BaseClass from '../base';

import {
  defaultProjection
} from '../map-layer-base';

import HTMLMapLayerGroup from '../map-layer-group';

import {
  html as shadowRootHTML,
} from './template';
import {
  defaultMapType,
  getBaseMap,
} from './basemap';

const defaultCenter = [0, 0];

export default class HTMLMapView extends BaseClass {

  static get observedAttributes () {
    return _.concat(super.observedAttributes, [
      'disabled',
      'basemap',
      'projection',
      'center',
      'zoom',
    ]);
  }

  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'disabled': 'disabled',
      'basemap': 'basemap',
      'projection': 'projection',
      'center': 'center',
      'zoom': 'zoom',
    });
  }

  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'disabled': 'disabled',
      'basemap': 'basemap',
      'projection': 'projection',
      'center': 'center',
      'zoom': 'zoom',
    });
  }

  static get attributeToPropertyConverters () {
    return _.merge({}, super.attributeToPropertyConverters, {
      'disabled': (isSet/*, val*/) => isSet,
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
            .map((v) => v.trim())
            .map((v) => parseFloat(v))
        : null
      ),
      'zoom': (isSet, val) => (
        isSet
        ? parseFloat(val)
        : null
      ),
    });
  }

  static get propertyToAttributeConverters () {
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
      // @param {number|null} val - Number value to be set, null to unset.
      'zoom': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : String(val),
      }),
    });
  }

  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {
      'disabled': (a, b) => a === b,
      'basemap': (a, b) => a === b,
      'projection': (a, b) => a === b,
      'center': (a, b) => a !== null && b !== null && a.length === b.length && a.every((x, i) => x === b[i]),
      'zoom': (a, b) => a === b,
    });
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    const {
      ol
    } = this;

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = shadowRootHTML;

    // Define bound/debounced/callback functions before the rest stuff.
    this.boundViewChangeCenterHandler_ = _.debounce(this.viewChangeCenterHandler_.bind(this), 30);
    this.boundViewChangeResolutionHanlder_ = _.debounce(this.viewChangeResolutionHanlder_.bind(this), 30);

    // Get references to all elements here.
    this.mapElement_ = shadowRoot.querySelector('#map');
    this.layerList_ = shadowRoot.querySelector('#layer-list');

    // Some caching stores.
    this.baseMapCache_ = {};
    this.viewCache_ = {}; //! Not used at the moment.

    // Controls are tied to the map view.
    this.mapControls_ = new ol.Collection();

    // Overlays are tied to geolocations.
    this.mapOverlays_ = new ol.Collection();

    this.mapInteractions_ = new ol.Collection();

    // This collection holds the child layers so it's easier to do batch updates.
    // @type {ol.Collection.<ol.layer.Base>}
    this.childMapLayerCollection_ = new ol.Collection();

    // This collection holds the child layer elements.
    // @type {ol.Collection.<HTMLMapLayerBase>}
    this.childLayerElementsCollection_ = HTMLMapLayerGroup.setupChildLayerElementsObserver(this, this.childMapLayerCollection_);

    // This collection holds the base map.
    this.baseMapLayerCollection_ = new ol.Collection([
      getBaseMap(defaultMapType, this.baseMapCache_)
    ]);

    // Options for instantiating the view.
    this.olViewOptions_ = {
      center: defaultCenter,
      constrainRotation: true,
      enableRotation: true,
      maxZoom: 28,
      minZoom: 0,
      projection: defaultProjection,
      rotation: 0,
      zoom: 3,
      zoomFactor: 2,
    };

    // Stores the active ol.View.
    this.mapView_ = null;
    this.updateView_();

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

    //! Test default property values.
    this.logInfo_({
      disabled: this.disabled,
      basemap: this.basemap,
      projection: this.projection,
      center: this.center,
      children: this.children,
    });
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback () {
    super.connectedCallback();

    // Reconnect the view.
    this.mountView_();

    // After this custom element is inserted into somewhere new, the map size has to be updated.
    // This has to be deferred because as this time the element might not get the correct styling.
    this.setTimeout(() => {
      this.olMap_.updateSize();
    });
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback () {
    super.disconnectedCallback();

    // Disconnect the view.
    this.unmountView_();
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {boolean} disabled
  get disabled () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('disabled'));
  }
  set disabled (val) {
    if (!typeCheck('Boolean | Null', val)) {
      throw new TypeError('Disabled has to be a boolean value.');
    }

    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('disabled'), val);
  }

  // @property {string} basemap
  get basemap () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('basemap'));
    return propValFromAttr === null ? defaultMapType : propValFromAttr;
  }
  set basemap (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map view base map type has to be a string.');
    }

    const _val = typeCheck('String', val) ? val.trim() : val;

    // Update internal models.
    const layer = getBaseMap(_val, this.baseMapCache_);

    this.baseMapLayerCollection_.clear();
    if (layer === null) {
      throw new TypeError('Invalid base map type.');
    } else {
      this.baseMapLayerCollection_.push(layer);
    }
    this.baseMapLayerCollection_.changed();

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('basemap'), _val);
  }

  // @property {string} projection
  get projection () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('projection'));
    return propValFromAttr === null ? defaultProjection : propValFromAttr;
  }
  set projection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map projection has to be a string.');
    }

    if (val !== null && !this.constructor.isValidProjection(val)) {
      throw new TypeError('Invalid projection.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getProjection().getCode();
    if (!this.isIdenticalPropertyValue_('projection', oldVal, val)) {
      this.updateView_({
        projection: val
      });
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('projection'), val);
  }

  get center () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('center'));
    return propValFromAttr === null ? defaultCenter : propValFromAttr;
  }
  set center (val) {
    if (!typeCheck('(Number, Number) | Null', val)) {
      throw new TypeError('Map view center has to be an array of 2 numbers.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getCenter();
    if (!this.isIdenticalPropertyValue_('center', oldVal, val)) {
      this.mapView_.setCenter(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('center'), val);
  }

  get zoom () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('zoom'));
    return propValFromAttr === null ? this.mapView_.getZoom() : propValFromAttr;
  }
  set zoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Map view zoom has to be a number.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getZoom();
    if (!this.isIdenticalPropertyValue_('zoom', oldVal, val)) {
      this.mapView_.setZoom(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('zoom'), val);
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Update the map view with the given options.
   * @param {Object} options
   */
  updateView_ (options) {
    //! Worry about caching later.

    const finalOptions = this.olViewOptions_ = _.merge(this.olViewOptions_, !this.mapView_ ? null : {
      center: this.mapView_.getCenter(),
      projection: this.mapView_.getProjection().getCode(),
      rotation: this.mapView_.getRotation(),
      zoom: this.mapView_.getZoom(),
    }, options);

    const newView = new this.ol.View(finalOptions);
    this.setView_(newView);

    if (this.connected_) {
      this.mountView_();
    }
  }

  setView_ (newView) {
    const oldView = this.mapView_;

    // These listener bindings should not be moved to a 'change:view' handler,
    // since the 'change:view' happens when the view is mounted, while these bindings
    // should happen as soon as possible to avoid side-effects.

    if (oldView) {
      // Detach listeners.
      oldView.un('change:center', this.boundViewChangeCenterHandler_);
      oldView.un('change:resolution', this.boundViewChangeResolutionHanlder_);
    }

    if (newView) {
      // Attach listeners.
      newView.on('change:center', this.boundViewChangeCenterHandler_);
      newView.on('change:resolution', this.boundViewChangeResolutionHanlder_);
    }

    this.mapView_ = newView;
  }

  viewChangeCenterHandler_ ({/*type, key, oldValue, */target}) {
    this.center = target.getCenter();
  }

  viewChangeResolutionHanlder_ ({/*type, key, oldValue, */target}) {
    this.zoom = target.getZoom();
  }

  mountView_ () {
    this.log_('mountView_');

    this.mapView_.setCenter(this.center);
    this.olMap_.setView(this.mapView_);
  }
  unmountView_ () {
    this.log_('unmountView_');

    this.olMap_.setView(null);
  }

  /**
   * Set the new projection and also update other related properties (e.g. coordinates).
   * @param {string} fromProj
   * @param {string} toProj
   */
  switchProjection (fromProj, toProj) {
    this.log_('switchProjection', {
      fromProj,
      toProj
    });

    const oldCenter = this.center,
          newCenter = this.ol.proj.transform(oldCenter, fromProj, toProj);

    this.logInfo_({
      oldCenter,
      newCenter
    });

    this.projection = toProj;
    this.center = newCenter;

    // Tell children to switch projections as well.
    this.childLayerElementsCollection_.forEach((item) => item.switchProjection(fromProj, toProj));
  }

} // HTMLMapView
