ICAL.Recurring = ICAL.Recurring || {};

ICAL.Recurring.Window = (function() {
  'use strict';

  function incrementFrequency(property) {
    return function (time, window) {
      var newValue = time[property] + (1 * window.interval);
      time[property] = newValue;
      this.flatten(time);
    };
  }

  function nearestDate(property, diffCalc) {
    return function(target, time, window) {
      // rely on the callback to generate a difference based on scale.
      var difference = diffCalc.apply(this, arguments);

      // the magic here is detecting the remainder and subtracting it by the interval.
      var remainder = (difference) % window.interval;
      var original = time[property];

      // optimize flushes by reading then writing
      time[property] = original + (difference - remainder);
    };
  }

  var FREQUENCIES = {
    yearly: {
      flatten: function(time) {
        time.month = 1;
        time.day = 1;
      },

      increment: incrementFrequency('year'),

      moveToNearestDate: nearestDate('year', function(target, time, window) {
        return target.year - time.year;
      })
    },

    monthly: {
      flatten: function(time) {
        time.day = 1;
      },

      increment: incrementFrequency('month'),
      moveToNearestDate: nearestDate('month', function(target, time, window) {
        return (
          // calculate the difference in years
          ((target.year - time.year) * 12) +
          // calculate the difference in months
          target.month - time.month
        );
      })
    },

    weekly: {
      increment: function(time, window) {
        // DOY (this value is sunday)
        var dayOfWeek = time.dayOfWeek(window.weekStart);

        // round out to the next week
        var days = 8 - dayOfWeek;

        // handle intervals over 1 (which is handled by the above logic.
        days += (7 * (window.interval - 1));

        time.day += days;
      },

      moveToNearestDate: function(target, time, window) {
        // we need to calculate the difference of days
        var diff = target.subtractDate(time);

        var currentDayOfWeek = time.dayOfWeek(window.weekStart);

        // figure out when next week is
        var toNextWeek = 8 - currentDayOfWeek;

        if (diff.days < toNextWeek) {
          // don't jump if its within this week
          return 0;
        }

        var targetOffset = target.dayOfWeek(window.weekStart) - 1;
        var numberOfWeeks = (
          // figure out the number of days from weekstart->weekstart
          (
            (diff.days - targetOffset) +
            (currentDayOfWeek - 1)
          ) / 7
        );

        // now that we have the number of weeks its possible to determine
        // the closest date possible.
        numberOfWeeks -= (numberOfWeeks % window.interval);

        // add the weeks but subtract the current day so we add the correct amount
        // to the existing time object rather then from the beginning of that week.
        time.day += (numberOfWeeks * 7) - (currentDayOfWeek - 1);
      }

    },

    daily: {
      increment: function(time, window) {
        time.day += 1 * window.interval;
      }
    }
  };

  /**
   * Representation of a given "window" or scope of a RRULE's FREQ property.
   *
   *
   *    var monthly = ICAL.Recurring.Window(
   *      'monthly', // lowercase freq part
   *      2 // interval (defaults to 1)
   *    );
   *
   *
   */
  function Window(options) {
    // frequency
    var freq = options.frequency && options.frequency.toLowerCase();
    var freqHandler = FREQUENCIES[freq];
    if (!freqHandler) {
      throw new Error(
        'Invalid frequency "' + freq + '" use one of : ' +
        Object.keys(FREQUENCIES).join(', ')
      );
    }

    this.frequency = freq;
    this._frequencyHandler = freqHandler;

    // interval
    if (options.interval) {
      var interval = parseInt(options.interval, 10);

      if (interval && interval > 0) {
        this.interval = interval;
      }
    }

    // numeric week start

    if (options.weekStart) {
      if (typeof(options.weekStart) !== 'number') {
        throw new Error('third argument (week start) should be numeric');
      }
      this.weekStart = options.weekStart;
    }
  }

  Window.prototype = {
    interval: 1,

    weekStart: ICAL.Time.MONDAY,

    /**
     * Increment a given time object to the start of the next window.
     *
     * @param {ICAL.Time} time to increment.
     */
    increment: function(time) {
      this._frequencyHandler.increment(
        time, this
      );
    },

    /**
     * Attempt to increment the given time to a window near or at
     * the target time. Note: this is merely best effort.
     *
     * This function will _never_ increment time beyond the targetTime.
     *
     *
     * @param {ICAL.Time} target desired time to increment to.
     * @param {ICAL.Time} time manipulated to be closer to target time according to interval rules.
     */
    moveToNearestDate: function(target, time) {
      // target must always be in the future
      if (target.compare(time) < 0) {
        throw new Error('move to target must be in the future');
      }

      this._frequencyHandler.moveToNearestDate(
        target,
        time,
        this
      );
    }
  };

  return Window;

}());
