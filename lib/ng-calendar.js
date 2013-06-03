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
    // scope: {}, // {} = isolate, true = child, false/undefined = no change
    // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'template/calendar.html',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {
      cal = new Calendar().weeksCalendar(2014, 6, 12, null, function(currentDate) {
        return currentDate.getDate();
      });
      $scope.cal = cal;
    }
  };
}]);