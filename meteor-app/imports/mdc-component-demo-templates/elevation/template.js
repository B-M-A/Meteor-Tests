import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_elevation",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
  import './template.css';
});

tplClass.helpers({
});

tplClass.events({
  'mouseenter #hover-el' (event, tplInst) {
    event.currentTarget.classList.remove('mdc-elevation--z2');
    event.currentTarget.classList.add('mdc-elevation--z8');
  },
  'mouseleave #hover-el' (event, tplInst) {
    event.currentTarget.classList.remove('mdc-elevation--z8');
    event.currentTarget.classList.add('mdc-elevation--z2');
  }
});
