import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { textfield } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_textfield",
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
  // Initialize all MDC components.
  this.$('.mdc-textfield:not([data-demo-no-auto-js])').each((index, element) => {
    textfield.MDCTextfield.attachTo(element);
  });

  this.section_ = this.$('#demo-textfield-wrapper')[0];
  this.helptext_ = this.$(this.section_).find('.mdc-textfield-helptext')[0];
  this.tfRoot_ = this.$(this.section_).find('.mdc-textfield')[0];
  this.mdcTf_ = new textfield.MDCTextfield(this.tfRoot_);

  this.section_multiline_ = this.$('#demo-textfield-multiline-wrapper')[0];
  this.tfRoot_multiline_ = this.$(this.section_multiline_).find('.mdc-textfield')[0];
  this.mdcTf_multiline_ = new textfield.MDCTextfield(this.tfRoot_multiline_);

  this.section_fullwidth_ = this.$('#demo-fullwidth-wrapper')[0];
  this.tfRoot_fullwidth_ = this.$(this.section_fullwidth_).find('.mdc-textfield')[0];
  this.tfMultiRoot_ = this.$(this.section_fullwidth_).find('.mdc-textfield--multiline')[0];
  this.mdcTf_fullwidth_ = new textfield.MDCTextfield(this.tfRoot_fullwidth_);
  this.mdcTfMulti_ = new textfield.MDCTextfield(this.tfMultiRoot_);
});

tplClass.helpers({
});

tplClass.events({
  'change #disable' (event, tplInst) {
    tplInst.mdcTf_.disabled = event.currentTarget.checked;
  },
  'change #rtl' (event, tplInst) {
    if (event.currentTarget.checked) {
      tplInst.section_.setAttribute('dir', 'rtl');
    } else {
      tplInst.section_.removeAttribute('dir');
    }
  },
  'change #dark-theme' (event, tplInst) {
    tplInst.section_.classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-theme--dark');
  },
  'change #dense' (event, tplInst) {
    tplInst.tfRoot_.classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-textfield--dense');
  },
  'change #required' (event, tplInst) {
    tplInst.tfRoot_.querySelector('.mdc-textfield__input').required = event.currentTarget.checked;
  },
  'change #use-helptext' (event, tplInst) {
    tplInst.mdcTf_.helptextElement = event.currentTarget.checked ? tplInst.helptext_ : null;
    tplInst.helptext_.style.display = event.currentTarget.checked ? 'block' : 'none';
    tplInst.$('#persistent-help-text')[0].disabled = !event.currentTarget.checked;
    tplInst.$('#helptext-as-validation')[0].disabled = !event.currentTarget.checked;
  },
  'change #persistent-help-text' (event, tplInst) {
    tplInst.helptext_.classList[event.currentTarget.checked ? 'add' : 'remove'](
      'mdc-textfield-helptext--persistent'
    );
  },
  'change #helptext-as-validation' (event, tplInst) {
    tplInst.helptext_.classList[event.currentTarget.checked ? 'add' : 'remove'](
      'mdc-textfield-helptext--validation-msg'
    );
  },
  'change #multi-disable' (event, tplInst) {
    tplInst.mdcTf_multiline_.disabled = event.currentTarget.checked;
  },
  'change #multi-rtl' (event, tplInst) {
    if (event.currentTarget.checked) {
      tplInst.section_multiline_.setAttribute('dir', 'rtl');
    } else {
      tplInst.section_multiline_.removeAttribute('dir');
    }
  },
  'change #multi-dark-theme' (event, tplInst) {
    tplInst.section_multiline_.classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-theme--dark');
  },
  'change #multi-required' (event, tplInst) {
    tplInst.tfRoot_multiline_.querySelector('.mdc-textfield__input').required = event.currentTarget.checked;
  },
  'change #fullwidth-disable' (event, tplInst) {
    [tplInst.mdcTf_fullwidth_, tplInst.mdcTfMulti_].forEach((component) => {
      component.disabled = event.currentTarget.checked;
    });
  },
  'change #fullwidth-dense' (event, tplInst) {
    [tplInst.tfRoot_fullwidth_, tplInst.tfMultiRoot_].forEach((el) => {
      el.classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-textfield--dense');
    });
  },
  'change #fullwidth-dark-theme' (event, tplInst) {
    tplInst.section_fullwidth_.classList[event.currentTarget.checked ? 'add' : 'remove']('mdc-theme--dark');
  }
});
