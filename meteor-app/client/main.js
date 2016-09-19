import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { InfiniLoad } from "meteor/zodiase:infinite-load";

import './main.html';

const db = new Mongo.Collection('data');

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

Meteor.startup(() => {
  const infDb = window.infDb = new InfiniLoad(db, {
    verbose: true
  });
  infDb.start().then((infLd) => {
    console.log('infDb.stats', infLd.stats);
  });
});
