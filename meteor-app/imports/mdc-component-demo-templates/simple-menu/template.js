import { Template } from 'meteor/templating';

// Import MDC components from the meteor package.
import { menu } from 'meteor/zodiase:mdc-styleless';

import './template.html';

const tplName = "mdc_demo_simple_menu",
      tplClass = Template[tplName];

tplClass.onRendered(function templateOnRendered() {
  this.menuEl_ = this.$('.mdc-simple-menu')[0];
  this.mdcMenu_ = menu.MDCSimpleMenu.attachTo(this.menuEl_);
});

tplClass.events({
  'click .toggle' (event, tplInst) {
    tplInst.mdcMenu_.open = !tplInst.mdcMenu_.open;
  },
  'change input[name="dark"]' (event, tplInst) {
    if (event.currentTarget.checked) {
      tplInst.menuEl_.classList.add('mdc-simple-menu--theme-dark');
    } else {
      tplInst.menuEl_.classList.remove('mdc-simple-menu--theme-dark');
    }
  },
  'change input[name="position"]' (event, tplInst) {
    if (event.currentTarget.checked) {
      if (event.currentTarget.value) {
        var anchor = tplInst.$('.mdc-menu-anchor')[0];
        anchor.style.removeProperty('top');
        anchor.style.removeProperty('right');
        anchor.style.removeProperty('bottom');
        anchor.style.removeProperty('left');

        var vertical = event.currentTarget.value.split(' ')[0];
        var horizontal = event.currentTarget.value.split(' ')[1];
        anchor.style.setProperty(vertical, '0');
        anchor.style.setProperty(horizontal, '0');
      }
    }
  },
  'MDCSimpleMenu:selected .mdc-simple-menu' (event, tplInst) {
    const detail = event.originalEvent.detail;
    tplInst.$('#last-selected')[0].textContent = '"' + detail.item.textContent.trim() +
      '" at index ' + detail.index;
  }
});
