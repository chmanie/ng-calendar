(function (angular) {
  /**
   *  Module
   *
   * Description
   */

  angular.module('ngCalendar', [])

  .factory('Calendar', function ($window) {
    return $window.Calendar;
  })

  .factory('calListeners', function(){
    var listeners = {};
    var scope;
    return {
      setScope: function (scp) {
        scope = scp;
      },
      onDrop: function (cb) {
        listeners.drop = cb;
      },
      drop: function (calItem, targetDay, originDay) {
        if (listeners.drop) {
          listeners.drop(scope, {
            $item: calItem,
            $targetDay: targetDay,
            $originDay: originDay
          });
        }
      }
    };
  })

  .directive('calendar', function(Calendar, $parse, calListeners, $q){
    return {
      restrict: 'A',

      link: function($scope, element, attrs, controller) {

        var populateSync;

        if (attrs.calPopulate) {

          var POPULATE_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

          var match = attrs.calPopulate.match(POPULATE_REGEXP);

          if (!match) {
            populateSync = function (date, thisMonth, today, pastDay) {
              var populateFn = $parse(attrs.calPopulate);
              return populateFn($scope, {
                $date: date,
                $thisMonth: thisMonth,
                $today: today,
                $pastDay: pastDay 
              });
            };
          }
        }

        calListeners.setScope($scope);
        calListeners.onDrop($parse(attrs.calDrop));

        var calendar = new Calendar();

        // watchers and observers to update calendar
        $scope.$watch(function () { return $scope.$eval(attrs.calDate); }, updateCalendar);

        attrs.$observe('calendar', function () {
          updateCalendar($scope.date);
        });

        attrs.$observe('calWeeks', function () {
          updateCalendar($scope.date);
        });

        function updateCalendar (calendarDate) {
          var date = new Date(calendarDate);
          
          var cal = calendar.createCalendar(date, 
            {
              method: attrs.calendar,
              weekStart: attrs.calWeekStart,
              weeks: attrs.calWeeks 
            }, populateSync);

          $scope.calendar = cal.calendar;

          if (!match || populateSync || !attrs.calPopulate) return;

          var populateMatch = {
            itemName: match[3],
            source: match[4],
            mapper: match[1]
          };
          var propName = populateMatch.mapper.replace(populateMatch.itemName, '').substr(1);

          $q.when($scope.$eval(populateMatch.source)).then(function (calItems) {
            
            var populate = function (date, thisMonth, today, pastDay) {
              var calEvents = [];
              calItems.forEach(function (item) {
                var itemDate = new Date(item[propName]);
                if ((itemDate.getFullYear() !== date.getFullYear()) || (itemDate.getMonth() !== date.getMonth())) return;
                if (itemDate.getDate() === date.getDate()) {
                  calEvents.push(item);
                }
              });
              return calEvents;
            };

            cal.populate(populate);
          });

        }

      }
    };
  })

  /*
   * forked from angular-dragon-drop v0.3.1
   * (c) 2013 Brian Ford http://briantford.com
   * License: MIT
   */

  .directive('calElement', function ($document, $compile, $rootScope, calListeners, $timeout) {

      var body = $document[0].body,
        dragValue,
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

        enableSelect();
        $document.unbind('mousemove', drag);

        var dropArea = getElementBehindPoint(floaty, ev.clientX, ev.clientY);

        var accepts = function () {
          return !!dropArea.attr('cal-element');
        };

        while (dropArea.length > 0 && !accepts()) {
          dropArea = dropArea.parent();
        }

        if (dropArea.length > 0) {

          var expression = dropArea.attr('cal-element');
          var targetScope = dropArea.scope();
          var originScope = originElement.scope();
          var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);

          var targetList = targetScope.$eval(match[2]);

          if (targetList !== dragOrigin) {
            targetScope.$apply(function () {
              add(targetList, dragValue, dragKey);
            });

            calListeners.drop(dragValue, targetScope.day, originScope.day);

            $rootScope.$apply(function () {
              remove(dragOrigin, dragKey || dragOrigin.indexOf(dragValue));
            });
            killFloaty();
          } else {
            originElement.css({ 'opacity': '1'});
            killFloaty();
          }
        } else {
          $timeout(function () {
            floaty.css({
              'transition': 'all 0.5s',
              '-webkit-transition': 'all 0.5s',
              'left': (originElemOffsetX - body.scrollLeft) + 'px',
              'top': (originElemOffsetY - body.scrollTop) + 'px'
            });
            floaty.bind('webkitTransitionEnd', function () { // TODO: add other browser events
              originElement.css({ 'opacity': '1'});
              killFloaty();
            });
          }, 0);
        }
      });

      return {
        restrict: 'A',

        compile: function (container, attr) {

          // get the `thing in things` expression
          var expression = attr.calElement;
          var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);
          if (!match) {
            throw Error("Expected calElement in form of '_item_ in _collection_' but got '" +
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
            template = angular.element('<div>' + template + '</div>'); // TODO: better template
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
              
              originElement = angular.element(ev.target);

              var originScope = originElement.scope();

              var canDrag = originScope.$eval(child.attr('cal-entry-candrag'));

              if (dragValue || !canDrag) {
                return;
              }

              // find the right parent
              while (originElement.attr('cal-entry') === undefined) {
                originElement = originElement.parent();
              }

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
              var offset = getElementOffset(originElement[0]);

              dragOrigin = scope.$eval(rhs);
              // dragValue = angular.copy(dragValue);

              offsetX = (ev.pageX - offset.left);
              offsetY = (ev.pageY - offset.top);

              originElemOffsetX = offset.left;
              originElemOffsetY = offset.top;

              spawnFloaty();
              originElement.css({ 'opacity': '0'});
              drag(ev);
            });
          };
        }
      };
    });  
})(angular);