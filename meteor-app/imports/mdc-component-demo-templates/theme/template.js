import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { } from 'meteor/zodiase:mdc';

import './template.html';

const tplName = "mdc_demo_theme",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
});

tplClass.helpers({
});

tplClass.events({
});
