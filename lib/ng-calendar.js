/**
 *  Module
 *
 * Description
 */
angular.module('ng-calendar', [])

.factory('Calendar', function () {
  return Calendar;
})

.directive('calendar', ['Calendar', function(Calendar){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      calendarDate: '='
    }, // {} = isolate, true = child, false/undefined = no change
    controller: AppCtrl,
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: 'template/calendar.html',
    replace: true,
    transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {
      $scope.$watch('calendarDate', function(calendarDate) {
        date = new Date(calendarDate);
        cal = new Calendar().createCalendar(date, { method: iAttrs.calendar }, function(date, thisMonth, today, pastDay) {
          // TODO: populate wie calendarDate uebergeben
          var populate = typeof($scope[iAttrs.populate]) === 'function' ? $scope[iAttrs.populate](date, thisMonth, today, pastDay) : null;
          return {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            thisMonth: thisMonth,
            today: today,
            pastDay: pastDay,
            contents: populate
          };
        });
        $scope.cal = cal;
      });
    }
  };
}]);