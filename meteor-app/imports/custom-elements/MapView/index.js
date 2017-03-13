import ol from './libs/ol-v4.0.1-dist.js';
import olStyle from './libs/ol-v4.0.1-dist.css';

/*global customElements, HTMLElement*/

class MapView extends HTMLElement {
  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor() {
    super(); // always call super() first in the ctor.

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = `
<!-- Openlayers Styling -->
<style type="text/css">${olStyle.innerHTML}</style>

<!-- Custom Element Styling -->
<style type="text/css">
:host {
  /* This custom element should behave like an image. */
  display: inline-block;
  width: 400px;
  height: 300px;
}

#map {
  width: 100%;
  height: 100%;
}
</style>

<!-- Custom Element HTML -->
<div>Below is a map</div>
<div id="map" class="map"></div>
`;

    this.mapElement_ = shadowRoot.querySelector('#map');

    this.olMap_ = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      target: this.mapElement_,
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
  }

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback() {
    // After this custom element is inserted into somewhere new, the map size has to be updated.
    this.olMap_.updateSize();
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback() {}

  /**
   * An attribute was added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback.
   */
  attributeChangedCallback(attrName, oldVal, newVal) {}

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback() {}
}
customElements.define('map-view', MapView);
