import _ from 'lodash';

import ol from '../../libs/ol-v4.0.1-dist.js';

import BaseClass from '../base';

import {
  attributeToPropertyConversions,
  propertyToAttributeConversions,
  attributeValueComparators,
} from './attributes';

export default class HTMLMapLayerBase extends BaseClass {

  /**
   * Keys are attribute names.
   * Values are property names.
   * @property {Object.<string>}
   * @readonly
   */
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'name': 'name',
      'opacity': 'opacity',
      'extent': 'extent'
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
      'name': 'name',
      'opacity': 'opacity',
      'extent': 'extent'
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
      // Unique name for the layer.
      'name',
      // Opacity of the layer.
      'opacity',
      // Extent of the layer.
      'extent',
    ]);
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor() {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // @type {ol.layer.Base}
    this.olLayer_ = null;
  }

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
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('name'));
  }
  set name(val) {
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('name'), val);

    // Update internal models.
    this.olLayer_.set('name', val);
  }

  // @property {number} opacity
  get opacity() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('opacity'));
  }
  set opacity(val) {
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('opacity'), val);

    // Update internal models.
    this.olLayer_.setOpacity(val);
  }

  // @property {Array.<number>} extent
  get extent() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('extent'));
  }
  set extent(val) {
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('extent'), val);

    // Update internal models.
    this.olLayer_.setExtent(val);
  }

  /**
   * Customized public/private methods.
   */

};
