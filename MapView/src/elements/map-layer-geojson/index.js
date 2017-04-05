import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import HTMLMapLayerBase from '../map-layer-base';

const defaultDataProjection = 'EPSG:4326';
const defaultFeatureProjection = 'EPSG:4326';

/**
 * Usage:
 * <HTMLMapLayerGeoJSON
 *   // @inheritdoc
 *
 *   // Required. The url of the geojson data file.
 *   src-url="{string}"
 *   // The json string of the geojson data. This can not co-exist with "src-url".
 *   src-json="{string}"
 *   // Specify the projection the source data coordinates are in. It will only be used when no CRS is available in the data. Default value is "EPSG:4326".
 *   src-projection="{string}"
 *   // The projection used for displaying. This should match the map view projection. Default value is "EPSG:4326".
 *   projection="{string}"
 * >
 *   <HTMLMapLayerVectorStyle ... />
 * </HTMLMapLayerGeoJSON>
 */
export default class HTMLMapLayerGeoJSON extends HTMLMapLayerBase {

  // @override
  static get observedAttributes () {
    return _.concat(super.observedAttributes, [
      'src-url',
      'src-json',
      'src-projection',
      'projection',
    ]);
  }

  // @override
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'src-url': 'srcUrl',
      'src-json': 'srcJson',
      'src-projection': 'srcProjection',
      'projection': 'projection',
    });
  }

  // @override
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'srcUrl': 'src-url',
      'srcJson': 'src-json',
      'srcProjection': 'src-projection',
      'projection': 'projection',
    });
  }

  // @override
  static get attributeToPropertyConverters () {
    return _.merge({}, super.attributeToPropertyConverters, {
      'src-url': (isSet, val) => (
        isSet
        ? val
        : null
      ),
      'src-json': (isSet, val) => (
        isSet
        ? val
        : null
      ),
      'src-projection': (isSet, val) => (
        isSet
        ? val
        : null
      ),
      'projection': (isSet, val) => (
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
      'src-url': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      // @param {string|null} val - String value to be set, null to unset.
      'src-json': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      // @param {string|null} val - String value to be set, null to unset.
      'src-projection': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      // @param {string|null} val - String value to be set, null to unset.
      'projection': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
    });
  }

  // @override
  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {
      'srcUrl': (a, b) => a === b,
      'srcJson': (a, b) => a === b,
      'srcProjection': (a, b) => a === b,
      'projection': (a, b) => a === b,
    });
  }

  // @override
  static get layerClass () {
    return this.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.Vector;
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.
  } // constructor

  /**
   * Getters and Setters (for properties).
   */

  // @property {string|null} srcUrl
  get srcUrl () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcUrl'));
  }
  set srcUrl (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data url has to be a string.');
    }

    if (val === null) {
      // Update internal models.
      this.updateSource({
        url: undefined,
        format: undefined,
      });
    } else {
      //! Cannot have `src-json` set.

      // Update internal models.
      this.updateSource({
        url: val,
        format: new this.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        }),
        features: undefined,
      });
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcUrl'), val);
  }

  // @property {string|null} srcJson
  get srcJson () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcJson'));
  }
  set srcJson (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data JSON has to be a string.');
    }

    if (val === null) {
      // Update internal models.
      this.updateSource({
        features: undefined,
      });
    } else {
      //! Cannot have `src-url` set.

      // Update internal models.
      this.updateSource({
        features: (new this.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        })).readFeatures(JSON.parse(val)),
        url: undefined,
        format: undefined,
      });
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcJson'), val);
  }

  // @property {string|null} srcProjection
  get srcProjection () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcProjection'));
    return propValFromAttr === null ? defaultDataProjection : propValFromAttr;
  }
  set srcProjection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data projection has to be a string.');
    }

    //! Check if projection is valid.

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcProjection'), val);

    if (this.srcUrl) {
      this.logWarn_('Resetting src-url.');
      const swap = this.srcUrl;
      this.srcUrl = null;
      this.srcUrl = swap;
    }
    if (this.srcJson) {
      this.logWarn_('Resetting src-json.');
      const swap = this.srcJson;
      this.srcJson = null;
      this.srcJson = swap;
    }
  }

  // @property {string|null} projection
  get projection () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('projection'));
    return propValFromAttr === null ? defaultFeatureProjection : propValFromAttr;
  }
  set projection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer display projection has to be a string.');
    }

    //! Check if projection is valid.

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('projection'), val);

    if (this.srcUrl) {
      this.logWarn_('Resetting src-url.');
      const swap = this.srcUrl;
      this.srcUrl = null;
      this.srcUrl = swap;
    }
    if (this.srcJson) {
      this.logWarn_('Resetting src-json.');
      const swap = this.srcJson;
      this.srcJson = null;
      this.srcJson = swap;
    }
  }

  /**
   * Customized public/private methods.
   */

  // @override
  switchProjection (fromProj, toProj) {
    super.switchProjection(fromProj, toProj);

    this.projection = toProj;
  }

}
