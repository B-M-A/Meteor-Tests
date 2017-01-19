import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '@material/button/dist/mdc.button.css';
import { MDCRipple } from '@material/ripple/dist/mdc.ripple.js';
import '@material/ripple/dist/mdc.ripple.css';
import '@material/typography/dist/mdc.typography.css';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.onRendered(function helloOnRendered() {
  // Initialize all MDC-Ripples.
  this.$('.mdc-ripple-surface').each((index, element) => {
    MDCRipple.attachTo(element);
  });
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
