perfCompareSuite('ICAL.Time', function(perf, ICAL) {

  var date = new Date(2012, 0, 1);
  var time = new ICAL.Time({
    year: 2012,
    month: 1,
    day: 1
  });

  perf.test('date prop fetch', function() {
    date.getUTCMonth();
  });

  perf.test('time prop fetch', function() {
    time.month;
  });

  return

  perf.test('create without adjustment', function() {
    var time = new ICAL.Time({
      year: 2012,
      month: 1,
      day: 10,
      second :1
    });

    time.day += 1
  });

  perf.test('create and clone time', function() {
    var time = new ICAL.Time({
      year: 2012,
      month: 1,
      day: 32,
      second: 1
    });

    if (time.day !== 1) {
      throw new Error('test sanity fails for .day');
    }

    if (time.month !== 2) {
      throw new Error('test sanity fails for .month');
    }

    time.day += 1;
    time.clone();
  });

  perf.test('subtract date', function() {
    var time = new ICAL.Time({
      year: 2012,
      month: 1,
      day: 1,
      hour: 10,
      minute: 3
    });

    var time2 = new ICAL.Time({
      year: 2012,
      month: 10,
      day: 1,
      hour: 1,
      minute: 55
    });

    time.subtractDate(time2);
  });

  var dur = new ICAL.Duration({
    days: 3,
    hour: 3,
    minutes: 3
  });

  perf.test('add duration', function() {
    var time = new ICAL.Time({
      year: 2012,
      month: 1,
      day: 32,
      seconds: 1
    });

    time.addDuration(dur);

    // to trigger normalization
    time.year;
  });

  var timeA = new ICAL.Time({
    year: 2012,
    month: 1,
    day: 1,
    minute: 55
  });

  var timeB = new ICAL.Time({
    year: 2012,
    month: 10,
    day: 15,
    minute: 55
  });

  perf.test('compare', function() {
    timeA.compare(timeB);
  });

});
