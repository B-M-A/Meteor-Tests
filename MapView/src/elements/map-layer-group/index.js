import HTMLMapLayerBase from '../map-layer-base';

/*global MutationObserver*/

/**
 * NodeList -> Array.<Node>
 */
const getArrayFromNodeList = (nodeList) => Array.from(nodeList);

export default class HTMLMapLayerGroup extends HTMLMapLayerBase {

  // @override
  static get layerClass () {
    return this.ol.layer.Group;
  }

  /**
   * A static helper function for setting up observers for monitoring child layer element changes.
   * Does it potentially leak observers?
   * @param {HTMLElement} element
   * @returns {collection: ol.Collection.<HTMLMapLayerBase>, observer: MutationObserver, onLayerListChanged: function(Array.<ol.layer.Base>, ol.Collection.<HTMLMapLayerBase>)}
   */
  static setupChildLayerElementsObserver (element) {
    const collection = new this.ol.Collection();
    const observer = new MutationObserver(this.updateChildLayerElements_.bind(this, element, collection));
    const onLayerListChanged = (func) => {
      collection.on('change', ({/*type, */target}) => {
        const layers = target.getArray().map((el) => el.layer);
        func(layers, collection);
      });
    };

    observer.observe(element, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });

    return {
      collection,
      observer,
      onLayerListChanged,
    };
  }

  /**
   * Scan the children for layer elements.
   * @private
   * @param {HTMLElement} element
   * @param {ol.Collection} collection
   */
  static updateChildLayerElements_ (element, collection) {
    // Only scan one level. The elements in this level should handle their own children.
    const layerElements = getArrayFromNodeList(element.children).filter((node) => node instanceof HTMLMapLayerBase);

    collection.clear();
    collection.extend(layerElements);
    collection.changed();

    element.log_(`${layerElements.length} layer(s) loaded.`);
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    const {
      collection: childLayerElementsCollection,
      onLayerListChanged
    } = this.constructor.setupChildLayerElementsObserver(this);

    this.childLayerElementsCollection_ = childLayerElementsCollection;

    onLayerListChanged((layers) => {
      const layerCollection = this.layer.getLayers();
      layerCollection.clear();
      layerCollection.extend(layers);
    });
  } // constructor

  /**
   * Getters and Setters (for properties).
   */

  /**
   * Customized public/private methods.
   */

  // @override
  updateSource () {
    throw new Error('Can not update source of a layer group.');
  }

}
