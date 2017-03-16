import ol from '../../libs/ol-v4.0.1-dist.js';

const maxOpacity = 1.0;
const minOpacity = 0.1;

/**
 * An object specifying the type of a layer source and the options for it.
 * @typedef {{type: String, options: Object}} LayerSourceConfig
 */

/**
 * Take the options and return a replacement layer source config object.
 * @callback ConvertFunction
 * @param {Object} options
 * @returns {LayerSourceConfig}
 */

// @type {Object.<SourceType, ConvertFunction>}
const virtualLayerTypeMapping = {
        "GeoJSON": function (options) {
          if (options.json) {
            const features = (new ol.format.GeoJSON()).readFeatures(options.json);

            return {
              "type": "Vector",
              "options": {
                features
              }
            };
          } else if (options.jsonFile) {
            const format = new ol.format.GeoJSON();
            const url = options.jsonFile.url;

            return {
              "type": "Vector",
              "options": {
                url,
                format
              }
            };
          } else {
            throw new RangeError('Unsupported layer source type.');
          }
        }
      },
      supportedVirtualSourceTypes = Object.keys(virtualLayerTypeMapping),
      // @type {Object.<SourceType, LayerType>}
      layerTypeMapping = {
        "BingMaps": "Tile",
        "CartoDB": "Tile",
        "Cluster": "Vector",
        "ImageCanvas": "Image",
        "ImageMapGuide": "Image",
        //"Image": "Image",
        "ImageStatic": "Image",
        "ImageVector": "Image",
        "ImageWMS": "Image",
        "MapQuest": "Tile",
        "OSM": "Tile",
        "Raster": "Image",
        //"Source", // Abstract
        "Stamen": "Tile",
        "TileArcGISRest": "Tile",
        "TileDebug": "Tile",
        "TileImage": "Tile",
        "TileJSON": "Tile",
        //"Tile", // Abstract
        "TileUTFGrid": "Tile",
        "TileWMS": "Tile",
        "Vector": "Vector",
        "VectorTile": "VectorTile",
        "WMTS": "Tile",
        "XYZ": "Tile",
        "Zoomify": "Tile"
      },
      supportedSourceTypes = Object.keys(layerTypeMapping);

/**
 * Map the given layer source config, if a virtual one, to a replacement.
 * @param {LayerSourceConfig} config
 * @returns {LayerSourceConfig}
 */
const mapVirtualLayer = (config) => {
  return (supportedVirtualSourceTypes.indexOf(config.type) !== -1)
         ? virtualLayerTypeMapping[config.type](config.options)
         : config;
};

/**
 * @param {LayerSourceConfig} config
 * @returns {ol.layer.Base}
 */
export const getLayerFromConfig = (config) => {
  if (typeof config !== 'object') {
    throw new TypeError('Expect layer config to be an object.');
  }
  if (typeof config.id !== 'string') {
    throw new TypeError('Expect layer ID to be a string.');
  }
  if (typeof config.title !== 'string') {
    throw new TypeError('Expect layer title to be a string.');
  }
  if (typeof config.zIndex !== 'number') {
    throw new TypeError('Expect layer z-index to be a number.');
  }
  if (typeof config.visible !== 'boolean') {
    throw new TypeError('Expect layer visibility to be a boolean.');
  }
  if (typeof config.opacity !== 'number') {
    throw new TypeError('Expect layer opacity to be a number.');
  }
  if (config.opacity < minOpacity || config.opacity > maxOpacity) {
    throw new RangeError('Invalid layer opacity value.');
  }
  if (typeof config.extent !== 'undefined') {
    if (!Array.isArray(config.extent)) {
      throw new TypeError('Expect layer extent to be an array.');
    }
    if (config.extent.length !== 4) {
      throw new RangeError('Expect layer extent to be an array of length 4.');
    }
    for (let cell of config.extent) {
      if (typeof cell !== 'number') {
        throw new TypeError('Expect layer extent to contain only numbers.');
      }
    }
  }

  // Map virtual layer to a real one.
  config.source = mapVirtualLayer(config.source);

  if (typeof config.source !== 'object') {
    throw new TypeError('Expect layer source to be an object.');
  }
  if (typeof config.source.type !== 'string') {
    throw new TypeError('Expect layer source type to be a string.');
  }
  if (typeof config.source.options !== 'object') {
    throw new TypeError('Expect layer source options to be an object.');
  }
  if (supportedSourceTypes.indexOf(config.source.type) === -1) {
    throw new RangeError('Unsupported layer source type.');
  }
  const layerSource = new ol.source[config.source.type](config.source.options);
  const layerType = layerTypeMapping[config.source.type];
  const layer = new ol.layer[layerType]({
    id: config.id,
    title: config.title,
    source: layerSource,
    opacity: config.opacity,
    visible: config.visible,
    extent: config.extent,
    zIndex: config.zIndex
  });

  return layer;
};

export default {
  getLayerFromConfig
};
