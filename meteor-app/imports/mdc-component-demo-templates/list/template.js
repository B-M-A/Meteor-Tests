import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { checkbox, ripple, iconToggle } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_list",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
  this.favoritedStatus_ = new ReactiveVar('no');
});

tplClass.onRendered(function templateOnRendered() {
  // Initialize all MDC components.
  this.$('.mdc-checkbox').each((index, element) => {
    checkbox.MDCCheckbox.attachTo(element);
  });
  this.$('[data-demo-interactive-list] .mdc-list-item').each((index, element) => {
    ripple.MDCRipple.attachTo(element);
  });
});

tplClass.helpers({
  favoritedStatus () {
    return Template.instance().favoritedStatus_.get();
  }
});

tplClass.events({
  'change #toggle-rtl' (event, tplInst) {
    if (event.currentTarget.checked) {
      tplInst.$('#demo-wrapper')[0].setAttribute('dir', 'rtl');
    } else {
      tplInst.$('#demo-wrapper')[0].removeAttribute('dir');
    }
  },
  // Prevent link clicks from jumping demo to the top of the page
  'click [data-demo-interactive-list] .mdc-list-item' (event, tplInst) {
    event.preventDefault();
  }
});
