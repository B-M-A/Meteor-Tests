import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import HTMLMapLayerBase from '../map-layer-base';

const defaultMinZoom = 0;
const defaultMaxZoom = 18;

/**
 * Usage:
 * <HTMLMapLayerXYZ
 *   // @inheritdoc
 *
 *   // The url template of the xyz source.
 *   url="{string}"
 *   // The minimum zoom level the source supports.
 *   min-zoom="{number}"
 *   // The maximum zoom level the source supports.
 *   max-zoom="{number}"
 * />
 */
export default class HTMLMapLayerXYZ extends HTMLMapLayerBase {

  // @override
  static get observedAttributes () {
    return _.concat(super.observedAttributes, [
      // Url template of the layer source.
      // Required.
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
      'url',
      // Minimum zoom level.
      // Optional.
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
      'min-zoom',
      // Maximum zoom level.
      // Optional.
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
      'max-zoom',
    ]);
  }

  // @override
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'url': 'url',
      'min-zoom': 'minZoom',
      'max-zoom': 'maxZoom',
    });
  }

  // @override
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'url': 'url',
      'minZoom': 'min-zoom',
      'maxZoom': 'max-zoom',
    });
  }

  // @override
  static get attributeToPropertyConverters () {
    return _.merge({}, super.attributeToPropertyConverters, {
      'url': (isSet, val) => (
        isSet
        ? val
        : null
      ),
      'min-zoom': (isSet, val) => (
        isSet
        ? parseFloat(val)
        : null
      ),
      'max-zoom': (isSet, val) => (
        isSet
        ? parseFloat(val)
        : null
      ),
    });
  }

  // @override
  static get propertyToAttributeConverters () {
    return _.merge({}, super.propertyToAttributeConverters, {
      // @param {string|null} val - String value to be set, null to unset.
      'url': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      // @param {number|null} val - Number value to be set, null to unset.
      'min-zoom': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : String(val),
      }),
      // @param {number|null} val - Number value to be set, null to unset.
      'max-zoom': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : String(val),
      }),
    });
  }

  // @override
  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {
      'url': (a, b) => a === b,
      'minZoom': (a, b) => a === b,
      'maxZoom': (a, b) => a === b,
    });
  }

  // @override
  static get layerClass () {
    return this.ol.layer.Tile;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.XYZ;
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {string|null} url
  get url () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('url'));
  }
  set url (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Tiled WMS layer url has to be a string.');
    }

    // Update internal models.
    this.updateSource({
      url: val
    });

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('url'), val);
  }

  // @property {number} minZoom
  get minZoom () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('minZoom'));
    return propValFromAttr === null ? defaultMinZoom : propValFromAttr;
  }
  set minZoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer minimum zoom has to be a number.');
    }

    if (val < 0) {
      throw new RangeError('Layer minimum zoom can not be lower than 0.');
    }

    // Update internal models.
    this.updateSource({
      minZoom: val
    });

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('minZoom'), val);
  }

  // @property {number} maxZoom
  get maxZoom () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('maxZoom'));
    return propValFromAttr === null ? defaultMaxZoom : propValFromAttr;
  }
  set maxZoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer maximum zoom has to be a number.');
    }

    if (val < 0) {
      throw new RangeError('Layer maximum zoom can not be lower than 0.');
    }

    // Update internal models.
    this.updateSource({
      maxZoom: val
    });

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('maxZoom'), val);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerXYZ
