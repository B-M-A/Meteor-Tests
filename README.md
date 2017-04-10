# Demo App

This app shows how the transpiled js handles getter inheritance wrong.

Run this app and see the server console logs. Also refer to the code in `/server/main.js`.

The demo code is printing `this` in different spots of the inheritance tree. For instance methods, the results are correct. However, for the instance getter functions, the context in the parent class is wrong.

For reference, the output of running the test code directly in node and Chrome console are both:

```Bash
Test 1 should print "ChildClass".

ParentClass.showThis() ChildClass {}
ChildClass.showThis() ChildClass {}


Test 2 should print "ChildClass".

ChildClass.self ChildClass {}
ParentClass.self ChildClass {}
Returned child.self ChildClass {}
```
