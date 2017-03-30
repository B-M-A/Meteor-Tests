/*global customElements*/

import HTMLMapView from './elements/map-view';
import HTMLMapLayerGroup from './elements/map-layer-group';
import HTMLMapLayerTWMS from './elements/map-layer-twms';
import HTMLMapLayerXYZ from './elements/map-layer-xyz';

customElements.define('map-view', HTMLMapView);
customElements.define('map-layer-group', HTMLMapLayerGroup);
customElements.define('map-layer-twms', HTMLMapLayerTWMS);
customElements.define('map-layer-xyz', HTMLMapLayerXYZ);
