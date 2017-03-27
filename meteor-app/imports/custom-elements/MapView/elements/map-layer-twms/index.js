import { _ } from 'lodash';

import HTMLMapLayerBase from '../map-layer-base';

import {
  attributeToPropertyConversions,
  propertyToAttributeConversions,
  attributeValueComparators,
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

export default class HTMLMapLayerTWMS extends HTMLMapLayerBase {

  /**
   * Keys are attribute names.
   * Values are property names.
   * @property {Object.<string>}
   * @readonly
   */
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'url': 'url',
      'params': 'params',
      'server-type': 'serverType'
    });
  }

  /**
   * Keys are property names.
   * Values are attribute names.
   * @property {Object.<string>}
   * @readonly
   */
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'url': 'url',
      'params': 'params',
      'serverType': 'server-type'
    });
  }

  /**
   * Keys are attribute names.
   * Values are functions that convert attribute configs to property values.
   * @property {Object.<isSet: boolean, val: string -> *>}
   * @readonly
   */
  static get attributeToPropertyConverters() {
    return _.merge({}, super.attributeToPropertyConverters, attributeToPropertyConversions);
  }

  /**
   * Keys are attribute names.
   * Values are functions that convert property values to attribute configs.
   * @property {Object.<* -> {isSet: boolean, value: string}>}
   * @readonly
   */
  static get propertyToAttributeConverters() {
    return _.merge({}, super.propertyToAttributeConverters, propertyToAttributeConversions);
  }

  /**
   * Keys are attribute names.
   * Values are functions that compare two attribute values and return whether they are considered identical.
   * @property {Object.<* -> {a: *, b: * -> boolean}>}
   * @readonly
   */
  static get attributeComparators() {
    return _.merge({}, super.attributeComparators, attributeValueComparators);
  }

  static get observedAttributes() {
    return _.concat(super.observedAttributes, [
      // Url of the layer source.
      'url',
      // WMS request parameters formatted as a query string: Name1=Value1&Name2=Value2 (names and values require escaping)
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
      'params',
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
      'server-type'
    ]);
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor() {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // @type {ol.source.Source}
    this.olSource_ = /*null*/ new this.ol.source.TileWMS();

    // @type {ol.layer.Base}
    this.olLayer_ = /*null*/ new this.ol.layer.Tile({
      source: this.olSource_
    });
  } // constructor

  /**
   * Getters and Setters (for properties).
   */

  // @property {string} url
  get url() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('url'));
  }
  set url(val) {
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('url'), val);

    // Update internal models.
    this.olSource_.setUrl(val);
  }

  // @property {Object} params
  get params() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('params'));
  }
  set params(val) {
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('params'), val);

    // Update internal models.
    this.olSource_.updateParams(val);
  }

  /**
   * Customized public/private methods.
   */

};

customElements.define('map-layer-twms', HTMLMapLayerTWMS);
