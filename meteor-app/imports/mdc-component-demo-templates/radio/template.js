import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { radio } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_radio",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
  import './template.css';

  // Initialize all MDC components.
  this.$('.mdc-radio:not([data-demo-no-js])').each((index, element) => {
    radio.MDCRadio.attachTo(element);
  });
});

tplClass.helpers({
});

tplClass.events({
});
