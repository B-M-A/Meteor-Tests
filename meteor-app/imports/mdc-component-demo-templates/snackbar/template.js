import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { snackbar } from 'meteor/zodiase:mdc';

import './template.html';

const tplName = "mdc_demo_snackbar",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
  this.show_ = (sb) => {
    var data = {
      message: this.$('#message')[0].value,
      actionOnBottom: this.$('#action-on-bottom')[0].checked,
      multiline: this.$('#multiline')[0].checked
    };
    if (this.$('#action')[0].value) {
      data.actionText = this.$('#action')[0].value;
      data.actionHandler = function() {
        console.log(data);
      }
    }
    console.info(data);
    sb.show(data);
  };
});

tplClass.onRendered(function templateOnRendered() {
  this.mdcSnackbar_ = snackbar.MDCSnackbar.attachTo(this.$('#mdc-js-snackbar')[0]);
  this.mdcRtlSnackbar_ = snackbar.MDCSnackbar.attachTo(this.$('#mdc-rtl-js-snackbar')[0]);
});

tplClass.helpers({
});

tplClass.events({
  'click #show-snackbar' (event, tplInst) {
    tplInst.show_(tplInst.mdcSnackbar_);
  },
  'click #show-rtl-snackbar' (event, tplInst) {
    tplInst.show_(tplInst.mdcRtlSnackbar_);
  }
});
