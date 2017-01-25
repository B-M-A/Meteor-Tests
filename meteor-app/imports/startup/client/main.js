import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC-Ripple from the meteor package.
import { default as mdc } from 'meteor/zodiase:mdc-styleless';
import 'material-components-web/dist/material-components-web.css';

window.mdc = mdc;

import '/imports/mdc-component-demo-templates/button/template';
import '/imports/mdc-component-demo-templates/card/template';
import '/imports/mdc-component-demo-templates/checkbox/template';
import '/imports/mdc-component-demo-templates/temporary-drawer/template';
import '/imports/mdc-component-demo-templates/permanent-drawer-above-toolbar/template';
import '/imports/mdc-component-demo-templates/permanent-drawer-below-toolbar/template';
import '/imports/mdc-component-demo-templates/elevation/template';
import '/imports/mdc-component-demo-templates/fab/template';
import '/imports/mdc-component-demo-templates/icon-toggle/template';

import './main.html';
import './main.css';

const tplClass = Template.body;

tplClass.onCreated(function templateOnCreated() {
  this.demoSection_ = new ReactiveVar('');
});

tplClass.onRendered(function templateOnRendered() {
});

tplClass.helpers({
  demoTemplateName () {
    const sectionName = Template.instance().demoSection_.get(),
          templateName = `mdc_demo_${sectionName}`;

    return (!sectionName || !Template[templateName])
           ? ''
           : templateName;
  }
});

tplClass.events({
  'click .demo-nav a' (event, tplInst) {
    event.preventDefault();

    tplInst.demoSection_.set(event.currentTarget.getAttribute('data-for'));
  }
});
