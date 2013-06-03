function Calendar () {
}

// TODO: other view: 4 (2,3,arbitrary number) weeks from now on regardless of month limits

Calendar.prototype.monthCalendar = function(year, month, weekStart, action) {
  // set defaults
  var now = new Date();
  var cYear = year || now.getFullYear();
  var cMonth = month || now.getMonth();
  var cWeekStart = (weekStart === 0) ? 0 : weekStart || 1; // week starts on monday by default, sunday: 0
  
  // determine necessary dates
  var firstDayOfMonth = new Date(cYear, cMonth, 1).getDay(); // weekday of first month
  var lastDateOfMonth = new Date(cYear, cMonth+1, 0).getDate(); // number of days in current month
  var firstDayOffset = cWeekStart > firstDayOfMonth ? cWeekStart-7 : cWeekStart; // set offset for first day of view
  var firstDayOfView =  new Date(cYear, cMonth, -firstDayOfMonth+1+firstDayOffset); //  first day in first row
  // magic number 36. determines if month needs 5 or 6 week-rows (0 for sunday is replaced with 7)
  var weekRows = ((firstDayOfMonth === 0 ? 7 : firstDayOfMonth) + lastDateOfMonth > 36) ? 6 : 5;

  // initialize calendar. monthCal is returned at the end
  var currentDate = firstDayOfView;
  var monthCal = [];

  // cycle through every week and every day. build up calendar array.
  for (var week = 0; week < weekRows; week++) {
    monthCal[week]=[];
    for (var day = 0; day < 7; day++) {
      // determine exposed parameters
      var today = (now.getFullYear() === currentDate.getFullYear() && 
              now.getMonth() === currentDate.getMonth() && 
              now.getDate() === currentDate.getDate());

      // implementation of already past days
      var pastDay = (currentDate.valueOf() < now.valueOf() && !today);

      var thisMonth = (cMonth === currentDate.getMonth());

      // if action is defined only results of the action function are pushed into the calendar array
      if (action) {
        monthCal[week].push(action(currentDate, thisMonth, today, pastDay));
      } else {
        monthCal[week].push({date: currentDate, thisMonth: thisMonth, today: today, pastDay: pastDay});
      }
      // increment day
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1);
    }
  }

  return monthCal;

};