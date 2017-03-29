import { _ } from 'lodash';
import {
  typeCheck
} from 'type-check';

import HTMLMapLayerBase from '../map-layer-base';

export default class HTMLMapLayerTWMS extends HTMLMapLayerBase {

  static get observedAttributes() {
    return _.concat(super.observedAttributes, [
      // Url of the layer source.
      'url',
      // WMS request parameters formatted as a query string: Name1=Value1&Name2=Value2 (names and values require escaping)
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
      'params',
      // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
      'server-type',
    ]);
  }

  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'url': 'url',
      'params': 'params',
      'server-type': 'serverType',
    });
  }

  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'url': 'url',
      'params': 'params',
      'serverType': 'server-type',
    });
  }

  static get attributeToPropertyConverters() {
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
             .reduce((acc, [key, value]) => ({...acc, [key]: value}), {})
        : {}
      ),
      'server-type': (isSet, val) => (
        isSet
        ? val
        : null
      ),
    });
  }

  static get propertyToAttributeConverters() {
    return _.merge({}, super.propertyToAttributeConverters, {
      'url': (val) => {
        // Null is allowed for clearing the url.
        if (val === null) {
          return {isSet: false};
        }

        if (typeof val !== 'string') {
          throw new TypeError('Layer url has to be a string.');
        }

        return {
          isSet: true,
          value: val
        };
      },
      'params': (val) => {
        if (val === null) {
          return {isSet: false};
        }

        if (typeof val !== 'object') {
          throw new TypeError('Layer params has to be an object.');
        }

        return {
          isSet: true,
          value: Object.keys(val)
                 .map((key) => [key, val[key]]
                               .map((x) => encodeURIComponent(x))
                               .join('=')
                     )
                 .join('&')
        };
      },
      //@see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
//       'server-type'
    });
  }

  static get propertyComparators() {
    return _.merge({}, super.propertyComparators, {
//       'url': 'url',
//       'params': 'params',
//       'server-type': 'serverType',
    });
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
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Tiled WMS layer url has to be a string.');
    }

    // Update internal models.
    this.olSource_.setUrl(val);

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('url'), val);
  }

  // @property {Object} params
  get params() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('params'));
  }
  set params(val) {
    if (!typeCheck('Object | Null', val)) {
      throw new TypeError('Tiled WMS layer params has to be an object.');
    }

    // Update internal models.
    this.olSource_.updateParams(val);

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('params'), val);
  }

  /**
   * Customized public/private methods.
   */

}
