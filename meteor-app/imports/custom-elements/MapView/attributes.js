import { getBaseMap } from './basemap.js';

export const observedAttributes = [
  'disabled',
  'basemap',
  'projection',
];

export const attributeChangeHandlers = {
  'basemap': (context, oldVal, newVal) => {
    context.setBaseMap_(newVal);
  },
  'projection': (context, oldVal, newVal) => {
    context.setProjection_(newVal);
  },
};

export const attributeChangedCallback = (context, attrName, oldVal, newVal) => {
  const handler = attributeChangeHandlers[attrName];
  return handler ? handler(context, oldVal, newVal) : null;
};
