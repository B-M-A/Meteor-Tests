// Test importing MDC from the distribution files.

import mdc from 'material-components-web/dist/material-components-web.js';
import mdc_min from 'material-components-web/dist/material-components-web.min.js';

import 'material-components-web/dist/material-components-web.css';

window.mdc = mdc;
window.mdc_min = mdc_min;
