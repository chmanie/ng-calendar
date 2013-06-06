basePath = '../';

files = [
  MOCHA,
  MOCHA_ADAPTER,
  'test/lib/chai.js',
  'test/lib/jquery-2.0.2.min.js', // add juery for testing purposes only
  'components/angular/angular.js',
  'test/lib/angular/angular-mocks-1.1.5.js',
  'test/lib/sinon-1.7.1.js',
  'lib/calendar.js',
  'lib/ng-calendar.js',
  'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome', 'Safari', 'Firefox'];