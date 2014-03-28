(function (window) {
  function Calendar (date) {
    // a custom 'today' date can be injected
    this.now = date || new Date();
  }

  Calendar.prototype.monthCalendar = function(date, options, action) {
    if (options) {
      options.method = 'monthCalendar';
    } else {
      options = { method: 'monthCalendar' };
    }
    return this.createCalendar(date, options, action);
  };

  Calendar.prototype.weeksCalendar = function(date, options, action) {
    if (options) {
      options.method = 'weeksCalendar';
    } else {
      options = { method: 'weeksCalendar' };
    }
    return this.createCalendar(date, options, action);
  };

  Calendar.prototype.createCalendar = function (dateObj, options, action) {
    var date = dateObj || this.now;
    var cYear = date.getFullYear();
    var cMonth = date.getMonth();
    var cDate = date.getDate();
    var cWeekStart = (options.weekStart === 0) ? 0 : options.weekStart || 1; // week starts on monday by default, sunday: 0
    // TODO: switch
    var cWeeks, firstDayOfView, firstDayOffset;
    // --- monthCalendar ---
    if (options.method === 'monthCalendar') {
      var firstDayOfMonth = new Date(cYear, cMonth, 1).getDay(); // weekday of first month
      var lastDateOfMonth = new Date(cYear, cMonth+1, 0).getDate(); // number of days in current month
      firstDayOffset = cWeekStart > firstDayOfMonth ? cWeekStart-7 : cWeekStart; // set offset for first day of view
      firstDayOfView =  new Date(cYear, cMonth, firstDayOffset-firstDayOfMonth+1); //  first day in first row
      // calculate rows of view
      // TODO: simplify!
      if(firstDayOfView.getDate() === 1) {
        // Month starts at row 1 in column 1
        cWeeks = Math.ceil(lastDateOfMonth / 7);
      } else {
        var lastDateOfLastMonth = new Date(cYear, cMonth, 0).getDate();
        var additionalDays = lastDateOfLastMonth - firstDayOfView.getDate() + 1;
        cWeeks = Math.ceil((lastDateOfMonth + additionalDays) / 7);
      }
    // --- weeksCalendar ---
    } else if (options.method === 'weeksCalendar') {
      cWeeks = options.weeks || 4; // show 4 weeks by default
      firstDayOfView = new Date(cYear, cMonth, cDate);
      firstDayOffset = cWeekStart > firstDayOfView.getDay() ? cWeekStart-7 : cWeekStart;
      firstDayOfView.setDate(cDate - firstDayOfView.getDay() + parseInt(firstDayOffset, 10));
    }

    var currentDate = firstDayOfView;
    var cal = [];

    // create calendar model
    for (var week = 0; week < cWeeks; week++) {
      cal[week] = [];
      for (var day = 0; day < 7; day++) {
        // determine exposed parameters
        var today = (this.now.getFullYear() === currentDate.getFullYear() &&
                    this.now.getMonth() === currentDate.getMonth() &&
                    this.now.getDate() === currentDate.getDate());

        // implementation of already past days
        var pastDay = (currentDate.valueOf() < this.now.valueOf() && !today);

        var thisMonth = (cMonth === currentDate.getMonth());

        // TODO: thisWeek?

        // if action is defined only results of the action function are pushed into the calendar array
        if (action) {
          cal[week].push(action(currentDate, thisMonth, today, pastDay));
        } else {
          cal[week].push({date: currentDate, thisMonth: thisMonth, today: today, pastDay: pastDay});
        }
        // increment day
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1);
      }
    }

    return cal;

  };

  // for node.js
  if (typeof(module) !== 'undefined') {
    module.exports = Calendar;
  } else {
    window.Calendar = Calendar;
  }
})(window);