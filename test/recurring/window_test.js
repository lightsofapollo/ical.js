suite('ICAL.Recurring.Window', function() {

  var subject;
  var time;

  function createTime(year, month, day, hour, minute, second) {
    return new ICAL.Time({
      year: year,
      month: month,
      day: day || 1,
      hour: hour || 0,
      minute: minute || 0,
      second: second || 0
    });
  }

  suite('initialization', function() {

    test('with invalid frequency', function() {
      assert.throws(function() {
        new ICAL.Recurring.Window('foobarly');
      }, /invalid frequency/i);
    });

    test('without interval', function() {
      var subject = new ICAL.Recurring.Window({
        frequency: 'monthly'
      });

      assert.equal(subject.frequency, 'monthly');
      assert.equal(subject.interval, 1);
      assert.equal(subject.weekStart, ICAL.Time.MONDAY);
    });

    test('with week start', function() {
      var subject = new ICAL.Recurring.Window({
        frequency: 'monthly',
        weekStart: ICAL.Time.TUESDAY
      });

      assert.equal(subject.weekStart, ICAL.Time.TUESDAY);
    });

    test('with interval', function() {
      var subject = new ICAL.Recurring.Window({
        frequency: 'daily',
        interval: 2
      });

      assert.equal(subject.frequency, 'daily');
      assert.equal(subject.interval, 2);
    });
  });

  function verifyIncrement(options, time, expected) {
    var desc = '#increment ';

    desc += 'frequency=' + options.frequency;

    if (options.interval) {
      desc += ' interval=' + options.interval;
    }

    if (options.weekStart) {
      desc += ' weekStart=' + options.weekStart;
    }

    suite(desc, function() {
      var timeObject;
      setup(function() {
        subject = new ICAL.Recurring.Window(options);
        timeObject = new ICAL.Time(time);
      });

      test('iteration', function() {
        expected.forEach(function(timeRep, idx) {
          subject.increment(timeObject);

          var expectedTime = new ICAL.Time(timeRep);
          assert.deepEqual(
            expectedTime.toJSDate(),
            timeObject.toJSDate(),
            'increment #' + idx
          );
        });
      });
    });
  }

  function verifyMoveToNearestDate(options, target, time, result) {
    var targetDesc = JSON.stringify(target);
    var timeDesc = JSON.stringify(time);

    var desc = '#nearestDate target=' + targetDesc + ' time=' + timeDesc;

    test(desc, function() {
      var subject = new ICAL.Recurring.Window(options);
      var targetObj = new ICAL.Time(target);
      var timeObj = new ICAL.Time(time);

      subject.moveToNearestDate(targetObj, timeObj);

      assert.deepEqual(
        timeObj.toJSDate(),
        new ICAL.Time(result).toJSDate()
      );
    });
  }

  verifyIncrement(
    { frequency: 'yearly' },
    { year: 2012, month: 3, day: 17 },
    [
      { year: 2013, month: 1, day: 1 },
      { year: 2014, month: 1, day: 1 },
      { year: 2015, month: 1, day: 1 },
      { year: 2016, month: 1, day: 1 },
      { year: 2017, month: 1, day: 1 }
    ]
  );

  verifyIncrement(
    { frequency: 'yearly', interval: 5 },
    { year: 2010 },
    [
      { year: 2015 },
      { year: 2020 },
      { year: 2025 }
    ]
  );

  verifyIncrement(
    { frequency: 'monthly' },
    { year: 2012, month: 10, day: 5 },
    [
      { year: 2012, month: 11, day: 1 },
      { year: 2012, month: 12, day: 1 },
      { year: 2013, month: 1, day: 1 },
      { year: 2013, month: 2, day: 1 }
    ]
  );

  verifyIncrement(
    { frequency: 'monthly', interval: 5 },
    { year: 2012, month: 5 },
    [
      { year: 2012, month: 10 },
      { year: 2013, month: 3 },
      { year: 2013, month: 8 },
      { year: 2014, month: 1 }
    ]
  );

  verifyIncrement(
    { frequency: 'weekly' },
    { year: 2012, month: 1, day: 5 },
    // monday is default start of week per rfc5545
    [
      { year: 2012, month: 1, day: 9 },
      { year: 2012, month: 1, day: 16 },
      { year: 2012, month: 1, day: 23 },
      { year: 2012, month: 1, day: 30 },
      { year: 2012, month: 2, day: 6 }
    ]
  );

  verifyIncrement(
    { frequency: 'weekly', interval: 5 },
    { year: 2012, month: 1, day: 5 },
    // monday is default start of week per rfc5545
    [
      { year: 2012, month: 2, day: 6 },
      { year: 2012, month: 3, day: 12 }
    ]
  );

  verifyIncrement(
    { frequency: 'daily' },
    { year: 2012, month: 1, day: 30 },
    [
      { year: 2012, month: 1, day: 31 },
      { year: 2012, month: 2, day: 1 },
      { year: 2012, month: 2, day: 2 },
      { year: 2012, month: 2, day: 3 },
      { year: 2012, month: 2, day: 4 },
      { year: 2012, month: 2, day: 5 }
    ]
  );

  verifyIncrement(
    { frequency: 'daily', interval: 6 },
    { year: 2012, month: 1, day: 25 },
    [
      { year: 2012, month: 1, day: 31 },
      { year: 2012, month: 2, day: 6 }
    ]
  );

  // simplest case linear jump no intervals
  verifyMoveToNearestDate(
    { frequency: 'yearly' },
    { year: 2020 }, // target
    { year: 2010 }, // current
    { year: 2020 }  // expected
  );

  // cannot jump directly to year without breaking interval rule
  verifyMoveToNearestDate(
    { frequency: 'yearly', interval: 5 },
    { year: 2020 },
    { year: 2012 },
    { year: 2017 }
  );

  // interval rule allows jump
  verifyMoveToNearestDate(
    { frequency: 'yearly', interval: 12 },
    { year: 2024 },
    { year: 2012 },
    { year: 2024 }
  );

  // verify jumps in same year
  verifyMoveToNearestDate(
    { frequency: 'monthly' },
    { year: 2013, month: 7 },
    { year: 2012, month: 1 },
    { year: 2013, month: 7 }
  );

  // verify jumps to different years
  verifyMoveToNearestDate(
    { frequency: 'monthly' },
    { year: 2013, month: 11 },
    { year: 2012, month: 1 },
    { year: 2013, month: 11 }
  );

  // verify multi-year jump with interval
  verifyMoveToNearestDate(
    { frequency: 'monthly', interval: 7 },
    { year: 2020, month: 11 },
    { year: 1997, month: 2 },
    { year: 2020, month: 6 } // manually verified with math
  );

  // linear jump from partially completed week
  verifyMoveToNearestDate(
    { frequency: 'weekly' },
    { year: 2012, month: 1, day: 31 },
    { year: 2012, month: 1, day: 4 },
    // remember default week start is monday
    { year: 2012, month: 1, day: 30 }
  );

  // one day from now (don't move)
  verifyMoveToNearestDate(
    { frequency: 'weekly' },
    { year: 2012, month: 1, day: 5 },
    { year: 2012, month: 1, day: 4 },
    { year: 2012, month: 1, day: 4 }
  );

  // week with interval
  verifyMoveToNearestDate(
    { frequency: 'weekly', interval: 3 },
    { year: 2012, month: 1, day: 30 },
    { year: 2012, month: 1, day: 4 },
    { year: 2012, month: 1, day: 23 }
  );

  // large interval where its easy to skip over target date.
  verifyMoveToNearestDate(
    { frequency: 'weekly', interval: 15 },
    { year: 2013, month: 1, day: 1 },
    { year: 2012, month: 7, day: 18 },
    { year: 2012, month: 10, day: 29 }
  );

});
