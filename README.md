# MDC for Meteor / SASS issue

In `meteor-app/imports/startup/client/main.scss`, using `@import "{zodiase:mdc-sass}/card/mdc-card";` causes error:

```Bash
=> Errors prevented startup:                  
   
   While building for web.browser:
   /imports/startup/client/main.scss: Scss compiler error: Undefined variable: "$mdc-typography-styles".
```
