import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { iconToggle } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_icon_toggle",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
  this.favoritedStatus_ = new ReactiveVar('no');
});

tplClass.onRendered(function templateOnRendered() {
  import './template.css';

  // Initialize all MDC components.
  this.$('.mdc-icon-toggle').each((index, element) => {
    iconToggle.MDCIconToggle.attachTo(element);
  });
});

tplClass.helpers({
  favoritedStatus () {
    return Template.instance().favoritedStatus_.get();
  }
});

tplClass.events({
  'MDCIconToggle:change #add-to-favorites' (event, tplInst) {
    tplInst.favoritedStatus_.set(event.originalEvent.detail.isOn ? 'yes' : 'no');
  }
});
