import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import HTMLMapLayerBase from '../map-layer-base';

/**
 * Usage:
 * <HTMLMapLayerTWMS
 *   // @inheritdoc
 *
 *   // Required. The url of the wms source.
 *   url="{string}"
 *   // WMS request parameters formatted as a query string: Name1=Value1&Name2=Value2 (names and values require escaping).
 *   // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
 *   params="{string}"
 *   // Not currently used.
 *   // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
 *   server-type="{string}"
 * />
 */
export default class HTMLMapLayerTWMS extends HTMLMapLayerBase {

  // @override
  static get observedAttributes () {
    return _.concat(super.observedAttributes, [
      'url',
      'params',
      'server-type',
    ]);
  }

  // @override
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'url': 'url',
      'params': 'params',
      'server-type': 'serverType',
    });
  }

  // @override
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'url': 'url',
      'params': 'params',
      'serverType': 'server-type',
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
      'params': (isSet, val) => (
        isSet
        ? val.split('&')
             .map((pairStr) => pairStr.split('=').map((x) => decodeURIComponent(x)))
             .reduce((acc, [key, value]) => ({
               ...acc,
               [key]: value
             }), {})
        : {}
      ),
      'server-type': (isSet, val) => (
        isSet
        ? val
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
      'params': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : Object.keys(val)
                                     .map((key) => [key, val[key]]
                                                   .map((x) => encodeURIComponent(x))
                                                   .join('=')
                                         )
                                     .join('&'),
      }),
      //@see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
//       'server-type'
    });
  }

  // @override
  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {
      'url': (a, b) => a === b,
      'params': (a, b) => _.isEqual(a, b),
      'serverType': (a, b) => a === b,
    });
  }

  // @override
  static get layerClass () {
    return this.ol.layer.Tile;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.TileWMS;
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

  // @property {Object|null} params
  get params () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('params'));
  }
  set params (val) {
    if (!typeCheck('Object | Null', val)) {
      throw new TypeError('Tiled WMS layer params has to be an object.');
    }

    // Update internal models.
    this.updateSource({
      params: val
    });

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('params'), val);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerTWMS
