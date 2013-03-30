ICAL.Recurring = ICAL.Recurring || {};

ICAL.Recurring.Window = (function() {
  'use strict';

  var FREQUENCIES = {
    yearly: {
      increment: function(time, window) {
        var year = time.year + (1 * window.interval);

        time.year = year;
        time.month = 1;
        time.day = 1;
      }
    },

    monthly: {
      increment: function(time, window) {
        var month = time.month + (1 * window.interval);

        time.month = month;
        time.day = 1;
      }
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
    }
  };

  return Window;

}());
