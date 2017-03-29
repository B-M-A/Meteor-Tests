import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import BaseClass from '../base';

const defaultOpacity = 1;

export default class HTMLMapLayerBase extends BaseClass {

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

  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'name': 'name',
      'opacity': 'opacity',
      'extent': 'extent',
    });
  }

  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'name': 'name',
      'opacity': 'opacity',
      'extent': 'extent',
    });
  }

  static get attributeToPropertyConverters() {
    return _.merge({}, super.attributeToPropertyConverters, {
      'name': (isSet, val) => (
        isSet
        ? val.trim()
        : null
      ),
      'opacity': (isSet, val) => (
        isSet
        ? parseFloat(val)
        : null
      ),
      'extent': (isSet, val) => (
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
      // @param {string|null} val - String value to be set, null to unset.
      'name': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val,
      }),
      // @param {number|null} val - Number value to be set, null to unset.
      'opacity': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : String(val),
      }),
      // @param {Array.<number>|null} val - Array of 4 numbers value to be set, null to unset.
      'extent': (val) => ({
        isSet: !(val === null),
        value: (val === null) ? '' : val.join(', '),
      }),
    });
  }

  static get propertyComparators() {
    return _.merge({}, super.propertyComparators, {
      'name': (a, b) => a === b,
      'opacity': (a, b) => a === b,
      'extent': (a, b) => a !== null && b !== null && a.length === b.length && a.every((x, i) => x === b[i]),
    });
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
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Layer name has to be a string.');
    }

    if (typeCheck('String', val)) {
      val = val.trim();
    }

    // Update internal models.
    const oldVal = this.olLayer_.get('name');
    if (!this.isIdenticalPropertyValue_('name', oldVal, val)) {
      this.olLayer_.set('name', val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('name'), val);
  }

  // @property {number} opacity
  get opacity() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('opacity'));
  }
  set opacity(val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer opacity has to be a number.');
    }

    if (typeCheck('Number', val)) {
      if (val > 1 || val < 0) {
        throw new RangeError('Layer opacity should be between 0 and 1.');
      }
    }

    // Update internal models.
    const oldVal = this.olLayer_.getOpacity();
    if (!this.isIdenticalPropertyValue_('opacity', oldVal, val)) {
      this.olLayer_.setOpacity(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('opacity'), val);
  }

  // @property {Array.<number>} extent
  get extent() {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('extent'));
  }
  set extent(val) {
    if (!typeCheck('(Number, Number, Number, Number) | Null', val)) {
      throw new TypeError('Layer extent has to be an array of 4 numbers.');
    }

    // Update internal models.
    const oldVal = this.olLayer_.getExtent() || null;
    if (!this.isIdenticalPropertyValue_('extent', oldVal, val)) {
      this.olLayer_.setExtent(val);
    }

    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('extent'), val);
  }

  /**
   * Customized public/private methods.
   */

}

HTMLMapLayerBase.propertyComparators = _.merge({}, HTMLMapLayerBase.prototype.constructor.propertyComparators, {
  'name': (a, b) => a === b,
  'opacity': (a, b) => a === b,
//   'extent': 'extent',
});
