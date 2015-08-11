'use strict';

var REQUIRED_OPTIONS = ['name', 'interval'];
var INTERVALS = ['15_minute', '30_minute', 'hourly', 'daily', 'weekly', 'monthly'];

function Snitch(options) {
  var missingOptions;

  if (!options) {
    missingOptions = REQUIRED_OPTIONS;
  } else {
    missingOptions = REQUIRED_OPTIONS.filter(function (option) {
      return !options[option];
    });
  }

  if (missingOptions.length) {
    throw new Error('Missing required options: ' + missingOptions.join(', '));
  }

  if (INTERVALS.indexOf(options.interval) === -1) {
    throw new Error('Invalid snitch interval: ' + options.interval);
  }

  this.name = options.name;
  this.interval = options.interval;
  this.notes = options.notes || '';
  this.tags = options.tags || [];
}

Snitch.parse = function (data) {
  if (!data || !data.name || !data.type || !data.type.interval) {
    throw new Error('Invalid data');
  }

  var snitch = new Snitch({
    name: data.name,
    interval: data.type.interval
  });

  var keys = ['token', 'href', 'name', 'tags', 'status', 'checked_in_at', 'check_in_url', 'created_at', 'notes'];

  keys.forEach(function (key) {
    if ((key === 'created_at' || key === 'checked_in_at') && data[key] !== null) {
      snitch[key] = new Date(data[key]);
      return;
    }

    snitch[key] = data[key];
  });

  return snitch;
};

module.exports = Snitch;
