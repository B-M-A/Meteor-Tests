import { Template } from 'meteor/templating';

// Import MDC components from the meteor package.
import { radio } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_radio",
      tplClass = Template[tplName];

tplClass.onRendered(function templateOnRendered() {
  // Initialize all MDC components.
  this.$('.mdc-radio:not([data-demo-no-js])').each((index, element) => {
    radio.MDCRadio.attachTo(element);
  });
});
