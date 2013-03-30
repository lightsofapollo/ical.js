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

  function verifyIncrement(time, options, expected) {
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

  verifyIncrement(
    { year: 2012, month: 3, day: 17 },
    { frequency: 'yearly' },
    [
      { year: 2013, month: 1, day: 1 },
      { year: 2014, month: 1, day: 1 },
      { year: 2015, month: 1, day: 1 },
      { year: 2016, month: 1, day: 1 },
      { year: 2017, month: 1, day: 1 }
    ]
  );

  verifyIncrement(
    { year: 2010 },
    { frequency: 'yearly', interval: 5 },
    [
      { year: 2015 },
      { year: 2020 },
      { year: 2025 }
    ]
  );

  verifyIncrement(
    { year: 2012, month: 10, day: 5 },
    { frequency: 'monthly' },
    [
      { year: 2012, month: 11, day: 1 },
      { year: 2012, month: 12, day: 1 },
      { year: 2013, month: 1, day: 1 },
      { year: 2013, month: 2, day: 1 }
    ]
  );

  verifyIncrement(
    { year: 2012, month: 5 },
    { frequency: 'monthly', interval: 5 },
    [
      { year: 2012, month: 10 },
      { year: 2013, month: 3 },
      { year: 2013, month: 8 },
      { year: 2014, month: 1 }
    ]
  );

  verifyIncrement(
    { year: 2012, month: 1, day: 5 },
    { frequency: 'weekly' },
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
    { year: 2012, month: 1, day: 5 },
    { frequency: 'weekly', interval: 5 },
    // monday is default start of week per rfc5545
    [
      { year: 2012, month: 2, day: 6 },
      { year: 2012, month: 3, day: 12 }
    ]
  );

  verifyIncrement(
    { year: 2012, month: 1, day: 30 },
    { frequency: 'daily' },
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
    { year: 2012, month: 1, day: 25 },
    { frequency: 'daily', interval: 6 },
    [
      { year: 2012, month: 1, day: 31 },
      { year: 2012, month: 2, day: 6 }
    ]
  );

});
