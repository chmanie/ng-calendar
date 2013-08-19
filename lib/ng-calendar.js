/**
 *  Module
 *
 * Description
 */

angular.module('ngCalendar', ['btford.dragon-drop'])

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
      calendarDate: '=',
      populate: '='
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: AppCtrl, // TODO: encapsulate!!
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: 'template/calendar.html',
    replace: true,
    transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {
      $scope.$watch('calendarDate', function(calendarDate) {
        var date = new Date(calendarDate);
        // TODO: insert more options e.g. weekStart
        var cal = new Calendar().createCalendar(date, { method: iAttrs.calendar, weekStart: iAttrs.weekStart, weeks: iAttrs.weeks }, function(date, thisMonth, today, pastDay) {
          return {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            weekday: date.getDay(),
            thisMonth: thisMonth,
            today: today,
            pastDay: pastDay,
            contents: $scope.populate(date, thisMonth, today, pastDay)
          };
        });
        $scope.cal = cal;
      });
    }
  };
}]);