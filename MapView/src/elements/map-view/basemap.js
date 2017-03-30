import ol from '../../third-party/ol-v4.0.1-dist.js';

/**
 * A map from types to functions that generate layers.
 * string > * > ol.layer.Base
 */
const layerGenerators = {
  // Use an empty layer group to pretend it's an invisible layer.
  'none': () => (new ol.layer.Group()),
  'osm': () => (new ol.layer.Tile({source: new ol.source.OSM()})),
  'arcgis': () => (new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    })
  })),
};

/**
 * A map from aliases to their true type values.
 * string > string
 */
const typeAliases = {
  'default': 'osm',
  '': 'none'
};

export const defaultMapType = '';

/**
 * If the provided type is an alias, return the value that alias refers to.
 * string > string
 */
const getTrueType = (rawType) => {
  let trueType = rawType;
  const maxLoop = Object.keys(typeAliases).length * 2;
  let loopCount = 0;
  while (typeAliases.hasOwnProperty(trueType)) {
    if (loopCount >= maxLoop) {
      throw new Error('Too many alias lookups, perhaps there is a loop?');
    }
    trueType = typeAliases[rawType];
  }
  return trueType;
};

/**
 * Returns a new layer instance for the provided type if possible.
 * Returns null if the provided type is invalid.
 * string > ol.layer.Base | null
 *
 * @param {string} rawType
 * @param {Object} cache - Optional caching object. With caching we can get rid of some flickering when switch to a cached layer.
 * @return {ol.layer.Base|null}
 */
export const getBaseMap = (rawType, cache) => {
  // All keys are lower case.
  const lowerRawType = String(rawType).toLowerCase();
  // De-reference aliases.
  const trueType = getTrueType(lowerRawType);

  // If cache is provided and there's a cached value in it, use that.
  if (cache && cache.hasOwnProperty(trueType)) {
    return cache[trueType];
  }
  // Otherwise try to generate a new one.
  const layerGenerator = layerGenerators[trueType];
  // If a generator could not be found, return null;
  const layer = layerGenerator ? layerGenerator() : null;

  // Update cache if possible.
  if (cache) {
    cache[trueType] = layer;
  }

  return layer;
};
