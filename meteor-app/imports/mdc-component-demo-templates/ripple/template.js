import { Template } from 'meteor/templating';

// Import MDC components from the meteor package.
import { ripple } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_ripple",
      tplClass = Template[tplName];

tplClass.onRendered(function templateOnRendered() {
  // Initialize all MDC components.
  this.$('.mdc-ripple-surface').each((index, element) => {
    ripple.MDCRipple.attachTo(element);
  });
});
