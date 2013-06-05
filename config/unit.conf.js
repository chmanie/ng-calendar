basePath = '../';

files = [
  MOCHA,
  MOCHA_ADAPTER,
  'test/lib/chai.js',
  'assets/components/angular/angular.js',
  'test/lib/angular/angular-mocks-1.1.5.js',
  'test/lib/sinon-1.7.1.js',
  'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome', 'Safari', 'Firefox', 'PhantomJS'];