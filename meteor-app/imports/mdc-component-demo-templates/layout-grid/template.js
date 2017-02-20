import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { iconToggle } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_layout_grid",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
  this.current_ = new ReactiveVar('');

  this.update_ = (function() {
    var size = '(phone)';
    if (window.innerWidth >= 840) {
      size = '(desktop)';
    } else if (window.innerWidth >= 480) {
      size = '(tablet)';
    }
    this.current_.set(window.innerWidth + 'px ' + size);
  }).bind(this);
});

tplClass.onRendered(function templateOnRendered() {
  window.addEventListener('resize', this.update_);
  this.update_();
});

tplClass.onDestroyed(function templateOnDestroyed() {
  window.removeEventListener('resize', this.update_);
});

tplClass.helpers({
  current () {
    return Template.instance().current_.get();
  }
});

tplClass.events({
  'change #margin' (event, tplInst) {
    var marginSelect = event.currentTarget;
    document.documentElement.style.setProperty('--mdc-layout-grid-margin', marginSelect.value);
  },
  'change #gutter' (event, tplInst) {
    var gutterSelect = event.currentTarget;
    document.documentElement.style.setProperty('--mdc-layout-grid-gutter', gutterSelect.value);
  }
});
