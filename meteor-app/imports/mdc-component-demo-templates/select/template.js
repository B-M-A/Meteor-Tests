import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { select } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_select",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
  this.mdcSelect_ = select.MDCSelect.attachTo(this.$('#js-select')[0]);
});

tplClass.helpers({
});

tplClass.events({
  'MDCSelect:change #js-select' (event, tplInst) {
    var item = tplInst.mdcSelect_.selectedOptions[0];
    var index = tplInst.mdcSelect_.selectedIndex;
    tplInst.$('#currently-selected')[0].textContent = '"' + item.textContent + '" at index ' + index;
  },
  'change #dark-theme' (event, tplInst) {
    tplInst.$('#demo-wrapper')[0].classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-theme--dark');
  },
  'change #rtl' (event, tplInst) {
    if (event.currentTarget.checked) {
      tplInst.$('#demo-wrapper')[0].setAttribute('dir', 'rtl');
    } else {
      tplInst.$('#demo-wrapper')[0].removeAttribute('dir');
    }
  },
  'change #disabled' (event, tplInst) {
    tplInst.mdcSelect_.disabled = event.currentTarget.checked;
  }
});
