import { Template } from 'meteor/templating';

import '/imports/custom-elements/MapView';

import './main.html';

/**
 * Collect all named values inside a Form Element.
 * @param {HTMLFormElement} form
 * @return {Object}
 */
const collectFormValues = (form) => {
  const result = {},
        formElements = [...form.elements];

  formElements.forEach(({name, value}) => {
    // Ignore values without a proper name.
    if (!name) {
      return;
    }

    // When collecting the values, always assume there will be multiple values for the same name.
    if (typeof result[name] === 'undefined') {
      result[name] = [];
    }
    result[name].push(value);
  });

  // Break down value arrays with only one element.
  Object.keys(result).forEach((name) => {
    if (result[name].length === 1) {
      result[name] = result[name][0];
    }
  });

  return result;
};

Template.hello.events({
  'click button[role="trigger-switch-container"]' (event, instance) {
    const $map = instance.$('[role="map"]'),
          $container1 = instance.$('[role="container1"]'),
          $container2 = instance.$('[role="container2"]');

    if ($map.parent().is($container1)) {
      console.log('Relocating map to container 2.');
      $map.detach().appendTo($container2);
    } else if ($map.parent().is($container2)) {
      console.log('Relocating map to container 1.');
      $map.detach().appendTo($container1);
    } else {
      console.warn('Map at unexpected location. Relocating it back to container 1.');
      $map.detach().appendTo($container1);
    }
  },
  'submit form[role="change-basemap-type-by-attr"]' (event, instance) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget,
          $map = instance.$('[role="map"]'),
          formValues = collectFormValues(form);

    $map.attr('basemap', formValues.type);
  },
  'submit form[role="change-basemap-type-by-prop"]' (event, instance) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget,
          $map = instance.$('[role="map"]'),
          formValues = collectFormValues(form);

    $map.prop('basemap', formValues.type);
  },
  'submit form[role="change-projection"]' (event, instance) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget,
          $map = instance.$('[role="map"]'),
          formValues = collectFormValues(form);

    $map.attr('projection', formValues.projection);
  },
  'click button[role="trigger-change-view"]' (event, instance) {
    const $map = instance.$('[role="map"]'),
          mapView = $map[0];

    const newView = new mapView.ol.View({
      center: [0, 0],
      constrainRotation: true,
      enableRotation: true,
      maxZoom: 28,
      minZoom: 0,
      rotation: 0,
      zoom: 5,
      zoomFactor: 2
    });

    mapView.view = newView;
  }
});
