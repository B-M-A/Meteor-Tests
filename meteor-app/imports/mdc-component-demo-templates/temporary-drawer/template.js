import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC components from the meteor package.
import { drawer } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_temporary_drawer",
      tplClass = Template[tplName];

tplClass.onCreated(function templateOnCreated() {
});

tplClass.onRendered(function templateOnRendered() {
  import './template.css';

  // Initialize all MDC components.
  this.mdcDrawer_ = new drawer.MDCTemporaryDrawer(this.$('.mdc-temporary-drawer')[0]);
});

tplClass.helpers({
});

tplClass.events({
  'click .demo-menu' (event, tplInst) {
    tplInst.mdcDrawer_.open = true;
  }
});
