describe('APIClient', function () {
  var APIClient = require('../lib/api-client');
  var Snitch = require('../lib/snitch');

  var client;
  var responseProcessor;

  beforeEach(function () {
    client = new APIClient('fake-key');
    spyOn(client, 'makeRequest').and.returnValue({
      then: function (next) {
        responseProcessor = next;
      }
    });
  });

  describe('getSnitches', function () {
    it('should make a request for all snitches', function () {
      client.getSnitches();
      expect(client.makeRequest).toHaveBeenCalledWith('GET', '/snitches');
    });

    it('should make a request for snitches with tags', function () {
      client.getSnitches(['tag1', 'tag2']);
      expect(client.makeRequest).toHaveBeenCalledWith('GET', '/snitches?tags=tag1,tag2');
    });

    it('should handle empty array gracefully', function () {
      client.getSnitches();
      expect(responseProcessor([])).toEqual([]);
    });

    it('should process array of json into proper objects', function () {
      client.getSnitches();

      var response = [
        {
          token: '12345',
          name: 'Snitch 12345',
          type: {
            interval: '15_minute'
          }
        }
      ];

      var processed = responseProcessor(response);
      expect(processed.length).toBe(response.length);

      var snitch = processed[0];
      expect(snitch).toEqual(jasmine.any(Snitch));
      expect(snitch.token).toEqual('12345');
    });
  });

  describe('getSnitch', function () {
    it('should error when no token passed', function () {
      var get = function () {
        client.getSnitch();
      };

      expect(get).toThrowError('Missing token');
    });

    it('should accept a token', function () {
      client.getSnitch('c2354d53d2');
      expect(client.makeRequest).toHaveBeenCalledWith('GET', '/snitches/c2354d53d2');
    });

    it('should accept a snitch object', function () {
      var snitch = Snitch.parse({
        token: 'c2354d53d2',
        name: 'Existing Snitch',
        type: {
          interval: '15_minute'
        }
      });
      client.getSnitch(snitch);
      expect(client.makeRequest).toHaveBeenCalledWith('GET', '/snitches/c2354d53d2');
    });

    it('should result in a snitch object', function () {
      client.getSnitch('c2354d53d2');

      var snitch = responseProcessor({
        token: 'c2354d53d2',
        name: 'Fetched Snitch',
        type: {
          interval: '15_minute'
        }
      });

      expect(snitch).toEqual(jasmine.any(Snitch));
      expect(snitch.token).toEqual('c2354d53d2');
      expect(snitch.name).toEqual('Fetched Snitch');
    });
  });

  describe('createSnitch', function () {
    it('should error when no snitch given', function () {
      var create = function () {
        client.createSnitch();
      };

      expect(create).toThrowError('Invalid parameter');
    });

    it('should make a request to create the snitch', function () {
      var snitch = new Snitch({
        name: 'New Snitch',
        interval: '15_minute'
      });

      client.createSnitch(snitch);

      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches', {
        name: 'New Snitch',
        type: {
          interval: '15_minute'
        },
        notes: '',
        tags: []
      });
    });
  });

  describe('editSnitch', function () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.editSnitch();
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when non-snitch given', function () {
      var error = function () {
        client.editSnitch({});
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.editSnitch(snitch);
      };

      expect(error).toThrowError('Cannot pause a snitch without a token');
    });

    it('should accept a token', function () {
      client.pauseSnitch('12345');
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/12345/pause');
    });

    it('should accept a snitch', function () {
      client.pauseSnitch('12345');
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/12345/pause');
    });

    it('should make a request to edit the snitch', function () {
      var snitch = new Snitch({
        name: 'Hello',
        interval: '15_minute'
      });
      snitch.token = 'c2354d53d2';
      snitch.tags = ['hello', 'world'];

      client.editSnitch(snitch);
      expect(client.makeRequest).toHaveBeenCalledWith('PATCH', '/snitches/c2354d53d2', {
        name: 'Hello',
        type: {
          interval: '15_minute'
        },
        notes: '',
        tags: ['hello', 'world']
      });
    });
  });

  describe('pauseSnitch', function  () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.pauseSnitch();
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when non-snitch given', function () {
      var error = function () {
        client.pauseSnitch({});
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.pauseSnitch(snitch);
      };

      expect(error).toThrowError('Cannot edit a snitch without a token');
    });

    it('should make a request to edit the snitch', function () {
      var snitch = new Snitch({
        name: 'Hello',
        interval: '15_minute'
      });
      snitch.token = 'c2354d53d2';
      snitch.tags = ['hello', 'world'];

      client.pauseSnitch(snitch);
      expect(client.makeRequest).toHaveBeenCalledWith('PATCH', '/snitches/c2354d53d2', {
        name: 'Hello',
        type: {
          interval: '15_minute'
        },
        notes: '',
        tags: ['hello', 'world']
      });
    });
  });

  describe('deleteSnitch', function () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.deleteSnitch();
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when non-snitch given', function () {
      var error = function () {
        client.deleteSnitch({});
      };

      expect(error).toThrowError('Invalid parameter');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.deleteSnitch(snitch);
      };

      expect(error).toThrowError('Cannot delete a snitch without a token');
    });

    it('should make a request to delete the snitch', function () {
      var snitch = new Snitch({
        name: 'Hello',
        interval: '15_minute'
      });
      snitch.token = 'c2354d53d2';
      client.deleteSnitch(snitch);
      expect(client.makeRequest).toHaveBeenCalledWith('DELETE', '/snitches/c2354d53d2');
    });
  });
});
