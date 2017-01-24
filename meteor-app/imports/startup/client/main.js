import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Import MDC-Ripple from the meteor package.
import { default as mdc } from 'meteor/zodiase:mdc-styleless';
import 'material-components-web/dist/material-components-web.css';

window.mdc = mdc;

import '/imports/mdc-component-demo-templates/button/template';
import '/imports/mdc-component-demo-templates/card/template';
import '/imports/mdc-component-demo-templates/checkbox/template';

import './main.html';
