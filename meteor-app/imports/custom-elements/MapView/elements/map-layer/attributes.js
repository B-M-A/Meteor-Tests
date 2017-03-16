import { getBaseMap } from '../../basemap.js';

export const observedAttributes = [
  // Unique name for the layer.
  'name',
  'type',
  'opacity',
  'extent',
  'options',
];

const attributeChangeHandlers = {
//   'basemap': (context, oldVal, newVal) => {
//     context.setBaseMap_(newVal);
//   },
};

export const attributeChangedCallback = (context, attrName, oldVal, newVal) => {
  const handler = attributeChangeHandlers[attrName];
  return handler ? handler(context, oldVal, newVal) : null;
};
