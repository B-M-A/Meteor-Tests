import { Template } from 'meteor/templating';

import './main.html';

Template.hello.onRendered(function helloOnRendered() {
  this.snackbarContainer = this.$('[role="snackbar"]')[0];
  this.showSnackbarButton = this.$('[role="trigger-show-snackbar"]')[0];
});

Template.hello.events({
  'click [role="trigger-show-snackbar"]'(event, instance) {
    instance.showSnackbarButton.style.backgroundColor = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);

    const data = {
      message: 'Button color changed.',
      timeout: 2000,
      actionHandler: () => {
        instance.showSnackbarButton.style.backgroundColor = '';

        const snackbar = instance.snackbarContainer.MaterialSnackbar;

        if (snackbar.active) {
          snackbar.cleanup_();
        }
      },
      actionText: 'Undo'
    };

    instance.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  },
});
