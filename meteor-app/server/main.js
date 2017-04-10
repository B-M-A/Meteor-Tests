import { Meteor } from 'meteor/meteor';

class ParentClass {
  showThis () {
    console.log('ParentClass.showThis()', this);
  }
  get self () {
    console.log('ParentClass.self', this);
    return this;
  }
}

class ChildClass extends ParentClass {
  showThis () {
    super.showThis();
    console.log('ChildClass.showThis()', this);
  }
  get self () {
    console.log('ChildClass.self', this);
    return super.self;
  }
}

Meteor.startup(() => {
  const child = new ChildClass();

  console.log('Test 1', 'should print "ChildClass".\n');
  child.showThis();
  console.log('\n');

  console.log('Test 2', 'should print "ChildClass".\n');
  console.log('Returned child.self', child.self);
  console.log('\n');
});
