import { Template } from 'meteor/templating';

import './template.html';

const tplName = "mdc_demo_elevation",
      tplClass = Template[tplName];

tplClass.events({
  'mouseenter #hover-el' (event, tplInst) {
    event.currentTarget.classList.remove('mdc-elevation--z2');
    event.currentTarget.classList.add('mdc-elevation--z8');
  },
  'mouseleave #hover-el' (event, tplInst) {
    event.currentTarget.classList.remove('mdc-elevation--z8');
    event.currentTarget.classList.add('mdc-elevation--z2');
  }
});
