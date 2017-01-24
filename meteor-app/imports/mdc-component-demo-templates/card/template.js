import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_card",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
  import './template.css';
});

tplClass.helpers({
});

tplClass.events({
});
