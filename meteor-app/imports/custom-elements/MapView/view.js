import ol from './libs/ol-v4.0.1-dist.js';

export const defaultCenter = [0, 0];

/**
 * Returns a new view instance for the provided projection if possible.
 * Returns null if the provided projection is invalid.
 * string > ol.View | null
 *
 * @param {string} projection
 * @param {Object} cache - Optional caching object. With caching we can get rid of some flickering when switch to a cached view.
 * @return {ol.View|null}
 */
export const getView = (projection, cache) => {
  // If cache is provided and there's a cached value in it, use that.
  if (cache && cache.hasOwnProperty(projection)) {
    return cache[projection];
  }
  // Otherwise try to generate a new one.
  const proj = ol.proj.get(projection);
  // If the projection object could not be found, return null.
  const view = proj ? new ol.View({
    center: [0, 0],
    constrainRotation: true,
    enableRotation: true,
    maxZoom: 28,
    minZoom: 0,
    projection: projection,
    rotation: 0,
    zoom: 3,
    zoomFactor: 2
  }) : null;

  // Update cache if possible.
  if (cache) {
    cache[projection] = view;
  }

  return view;
};
