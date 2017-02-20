import { Template } from 'meteor/templating';

// Import MDC components from the meteor package.
import { drawer } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_temporary_drawer",
      tplClass = Template[tplName];

tplClass.onRendered(function templateOnRendered() {
  // Initialize all MDC components.
  this.mdcDrawer_ = new drawer.MDCTemporaryDrawer(this.$('.mdc-temporary-drawer')[0]);
});

tplClass.events({
  'click .demo-menu' (event, tplInst) {
    tplInst.mdcDrawer_.open = true;
  }
});
