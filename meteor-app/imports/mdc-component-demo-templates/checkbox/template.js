import { Template } from 'meteor/templating';

// Import MDC components from the meteor package.
import { checkbox } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_checkbox",
      tplClass = Template[tplName];

tplClass.onRendered(function templateOnRendered() {
  // Initialize all MDC components.
  this.mdcCheckbox_ = new checkbox.MDCCheckbox(this.$('#mdc-js-checkbox')[0]);
});

tplClass.events({
  'click #make-ind' (event, tplInst) {
    tplInst.mdcCheckbox_.indeterminate = true;
  }
});
