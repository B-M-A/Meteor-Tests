# Meteor Issue #4889
Trying to run this app with `meteor` would result in an error that may look like this:
```Bash
[[[[[ ~/Workspace/Meteor-Tests/meteor-app ]]]]]

=> Started proxy.                             
=> Started MongoDB.                           
                                              
/Users/xh/.meteor/packages/templating/.1.1.9.8ql7cx++os+web.browser+web.cordova/plugin.compileTemplatesBatch.os/npm/node_modules/meteor/promise/node_modules/meteor-promise/promise_server.js:116
      throw error;
            ^
Error: UNKNOWN, open '/Users/xh/Workspace/Meteor-Tests/meteor-app/public/ext-6.0.1/examples/classic/statusbar/fake.php'
```