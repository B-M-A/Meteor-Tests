import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/zodiase:check';

Meteor.startup(() => {
  // code to run on server at startup

  Meteor.methods({
    'check' (input) {
      check(input, Object, 'Expect input to be an object.');
    }
  })
});
