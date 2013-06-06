expect = chai.expect;
mocha.setup({ignoreLeaks: true}); // disable global leak error

describe('ng-calendar directive', function() {

  beforeEach(module('ng-calendar'));

  beforeEach(inject(function($compile, $rootScope, $httpBackend) {
    $httpBackend.when('GET', 'template/calendar.html').respond(
      '<table>' +
        '<tr ng-repeat="week in cal">' +
          '<td ng-repeat="day in week" ng-class="{today: day.today, thismonth: day.thisMonth}" data-day="{{day.date}}" data-month="{{day.month}}">' +
            '<span class="date">{{day.date}}</span>' +
          '</td>' +
        '</tr>' +
      '</table>');
    $httpBackend.expectGET('template/calendar.html');
    var elm = angular.element('<div data-calendar="monthCalendar" data-calendar-date="date" data-populate="populate"></div>');
    scope = $rootScope;
    scope.populate = sinon.spy();
    calendarElement = $compile(elm)(scope);
  }));

  it('should render the calendar template', function() {
    inject(function($httpBackend) {
      scope.date = new Date();
      $httpBackend.flush();
      expect(calendarElement.html()).to.contain('<tbody>');
    });
  });

  it('should assign today class correctly', function() {
    inject(function($httpBackend){
      scope.date = new Date();
      $httpBackend.flush();
      var todayElm = parseInt(calendarElement.find('.today span').html(),10);
      expect(todayElm).to.equal(scope.date.getDate());
    });
  });

  it('should assign thisMonth class correctly', function() {
    inject(function($httpBackend) {
      scope.date = new Date(2013, 5, 5);
      $httpBackend.flush();
      var thisMonthElm = parseInt(calendarElement.find('.thismonth span').html(),10);
      expect(thisMonthElm).to.equal(1);
    });
  });

  it('should run the populate function', function() {
    inject(function($httpBackend) {
      scope.date = new Date();
      $httpBackend.flush();
      expect(scope.populate.called).to.be.ok;
    });
  });

});