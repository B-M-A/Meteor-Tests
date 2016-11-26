var deps = {
  'Meteor': '1.4.2.3'
};

Package.describe({
  name: 'zodiase:some-package',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  'use strict';
  api.versionsFrom(deps.Meteor);
  api.use([
    'ecmascript',
    'isobuild:compiler-plugin@1.0.0'
  ]);
});

Package.registerBuildPlugin({
  name: 'build',
  use: [
    'caching-compiler@1.0.0',
    'ecmascript'
  ],
  sources: [
    'plugin/build.js'
  ]
});
