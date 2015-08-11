'use strict';

describe('Snitch', function () {
  var Snitch = require('../lib/snitch');

  describe('constructor', function () {
    it('should error when no data passed', function () {
      var create = function () {
        new Snitch();
      };

      expect(create).toThrowError('Missing required options: name, interval');
    });

    it('should error on invalid interval', function () {
      var create = function () {
        new Snitch({
          name: 'New Snitch',
          interval: 'invalid'
        });
      };

      expect(create).toThrowError('Invalid snitch interval: invalid');
    });

    it('should succeed with valid data', function () {
      var snitch = new Snitch({
        name: 'New Snitch',
        interval: '15_minute',
        notes: 'Optional notes',
        tags: ['one', 'two', 'three']
      });

      expect(snitch.name).toEqual('New Snitch');
      expect(snitch.interval).toEqual('15_minute');
      expect(snitch.notes).toEqual('Optional notes');
      expect(snitch.tags).toEqual(['one', 'two', 'three']);
    });
  });

  describe('parse', function () {
    it('should error when no data passed', function () {
      var parse = function () {
        Snitch.parse();
      };

      expect(parse).toThrowError('Invalid data');
    });

    it('should succeed with valid data', function () {
      var validData = {
        token: 'c2354d53d2',
        href: '/v1/snitches/c2354d53d2',
        name: 'Daily Backups',
        tags: [
          'production',
          'critical'
        ],
        status: 'pending',
        checked_in_at: null,
        type: {
          'interval': 'daily'
        },
        check_in_url: 'https://nosnch.in/c2354d53d2',
        created_at: '2014-03-28T22:07:44.902Z',
        notes: 'Postgres box at 123.213.231.132',
        ignored_property: true
      };

      var snitch = Snitch.parse(validData);

      expect(snitch.token).toEqual(validData.token);
      expect(snitch.name).toEqual(validData.name);
      expect(snitch.interval).toEqual(validData.type.interval);
      expect(snitch.checked_in_at).toBe(null);
      expect(snitch.created_at).toEqual(jasmine.any(Date));
      expect(snitch.created_at.getTime()).toEqual(Date.parse('2014-03-28T22:07:44.902Z'));
      expect(snitch.tags).toEqual(jasmine.any(Array));
      expect(snitch.tags.length).toBe(2);
      expect(snitch.ignored_property).toBe(undefined);
    });
  });
});
