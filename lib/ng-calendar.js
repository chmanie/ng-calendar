/**
 *  Module
 *
 * Description
 */

angular.module('ngCalendar', ['btford.dragon-drop'])

.factory('Calendar', function () {
  return Calendar;
})

.directive('calendar', function(Calendar, $parse){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {}, // {} = isolate, true = child, false/undefined = no change
    // controller: AppCtrl, // TODO: encapsulate!!
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: 'template/calendar.html',
    replace: true,
    transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, attrs, controller) {
      
      function getDate() {
        return $scope.$parent.$eval(attrs.calendarDate);
      }

      var populate = $parse(attrs.populate);

      $scope.$watch(getDate, function(calendarDate) {
        var date = new Date(calendarDate);
        // TODO: insert more options e.g. weekStart
        var cal = new Calendar().createCalendar(date, { method: attrs.calendar, weekStart: attrs.weekStart, weeks: attrs.weeks }, function(date, thisMonth, today, pastDay) {
          return {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            weekday: date.getDay(),
            thisMonth: thisMonth,
            today: today,
            pastDay: pastDay,
            contents: populate($scope.$parent, {
              $date: date,
              $thisMonth: thisMonth,
              $today: today,
              $pastDay: pastDay 
            })
          };
        });
        $scope.cal = cal;
      });
    }
  };
})

/*
 * forked from angular-dragon-drop v0.3.1
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

.directive('calendarElement', function ($document, $compile, $rootScope) {

    var dragValue,
      dragKey,
      dragOrigin,
      dragDuplicate = false,
      floaty,
      offsetX,
      offsetY,
      originElement,
      originElemOffsetX,
      originElemOffsetY;

    var drag = function (ev) {
      var x = ev.clientX - offsetX,
          y = ev.clientY - offsetY;

      floaty.css('left', x + 'px');
      floaty.css('top', y + 'px');
    };

    var remove = function (collection, index) {
      if (collection instanceof Array) {
        return collection.splice(index, 1);
      } else {
        var temp = collection[index];
        delete collection[index];
        return temp;
      }
    };

    var add = function (collection, item, key) {
      if (collection instanceof Array) {
        collection.push(item);
      } else {
        collection[key] = item;
      }
    };

    var documentBody = angular.element($document[0].body);

    var disableSelect = function () {
      documentBody.css({
        '-moz-user-select': '-moz-none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none'
      });
    };

    var enableSelect = function () {
      documentBody.css({
        '-moz-user-select': '',
        '-khtml-user-select': '',
        '-webkit-user-select': '',
        '-ms-user-select': '',
        'user-select': ''
      });
    };

    var killFloaty = function () {
      if (floaty) {
        $document.unbind('mousemove', drag);
        floaty.remove();
        floaty = null;
        dragValue = dragOrigin = originElement = null;
      }
    };

    var getElementOffset = function (elt) {

      var box = elt.getBoundingClientRect();
      var body = $document[0].body;

      var xPosition = box.left + body.scrollLeft;
      var yPosition = box.top + body.scrollTop;

      return {
        left: xPosition,
        top: yPosition
      };
    };

    // Get the element at position (`x`, `y`) behind the given element
    var getElementBehindPoint = function (behind, x, y) {
      var originalDisplay = behind.css('display');
      behind.css('display', 'none');

      var element = angular.element($document[0].elementFromPoint(x, y));

      behind.css('display', originalDisplay);

      return element;
    };

    $document.bind('mouseup', function (ev) {
      if (!dragValue) {
        return;
      }

      $document.unbind('mousemove', drag);

      var dropArea = getElementBehindPoint(floaty, ev.clientX, ev.clientY);

      var accepts = function () {
        return !!dropArea.attr('calendar-element');
      };

      while (dropArea.length > 0 && !accepts()) {
        dropArea = dropArea.parent();
      }

      if (dropArea.length > 0) {

        var expression = dropArea.attr('calendar-element');
        var targetScope = dropArea.scope();
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);

        var targetList = targetScope.$eval(match[2]);

        if (targetList !== dragOrigin) {
          targetScope.$apply(function () {
            add(targetList, dragValue, dragKey);
          });
          $rootScope.$apply(function () {
            remove(dragOrigin, dragKey || dragOrigin.indexOf(dragValue));
          });
          killFloaty();
        } else {
          originElement.removeClass('transparent');
          killFloaty();
        }
      } else {
        window.setTimeout(function () {
          floaty.css({
            'transition': 'all 0.5s',
            '-webkit-transition': 'all 0.5s',
            'left': originElemOffsetX,
            'top': originElemOffsetY
          });
          floaty.bind('webkitTransitionEnd', function () { // TODO: add other browser events
            originElement.removeClass('transparent');
            killFloaty();
          });
        }, 0);
      }
    });

    return {
      restrict: 'A',

      compile: function (container, attr) {

        // get the `thing in things` expression
        var expression = attr.calendarElement;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);
        if (!match) {
          throw Error("Expected calendarElement in form of '_item_ in _collection_' but got '" +
            expression + "'.");
        }
        var lhs = match[1];
        var rhs = match[2];

        match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);

        var valueIdentifier = match[3] || match[1];
        var keyIdentifier = match[2];

        // pull out the template to re-use.
        // Improvised ng-transclude.
        var template = container.html();

        // wrap text nodes
        try {
          template = angular.element(template.trim());
          if (template.length === 0) {
            throw new Error('');
          }
        }
        catch (e) {
          template = angular.element('<div class="event">' + template + '</div>'); // TODO: better template
        }
        var child = template.clone();
        child.attr('ng-repeat', expression);

        container.html('');
        container.append(child);

        return function (scope, elt, attr) {

          var spawnFloaty = function () {
            scope.$apply(function () {
              floaty = template.clone();
              floaty.css('position', 'fixed');

              floaty.css('margin', '0px');
              floaty.css('z-index', '99999');

              var floatyScope = scope.$new();
              floatyScope[valueIdentifier] = dragValue;
              if (keyIdentifier) {
                floatyScope[keyIdentifier] = dragKey;
              }
              $compile(floaty)(floatyScope);
              documentBody.append(floaty);
              $document.bind('mousemove', drag);
              disableSelect();
            });
          };

          elt.bind('mousedown', function (ev) {
            if (dragValue) {
              return;
            }
            
            // find the right parent
            originElement = angular.element(ev.target);
            var originScope = originElement.scope();

            while (originScope[valueIdentifier] === undefined) {
              originScope = originScope.$parent;
              if (!originScope) {
                return;
              }
            }

            dragValue = originScope[valueIdentifier];
            dragKey = originScope[keyIdentifier];
            if (!dragValue) {
              return;
            }

            // get offset inside element to drag
            var offset = getElementOffset(ev.target);

            dragOrigin = scope.$eval(rhs);
            // dragValue = angular.copy(dragValue);

            offsetX = (ev.pageX - offset.left);
            offsetY = (ev.pageY - offset.top);

            originElemOffsetX = offset.left;
            originElemOffsetY = offset.top;

            spawnFloaty();
            originElement.addClass('transparent');
            drag(ev);
          });
        };
      }
    };
  });
;