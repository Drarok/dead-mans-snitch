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
    it('should error when no snitch', function () {
      var get = function () {
        client.getSnitch();
      };

      expect(get).toThrowError('Missing snitch');
    });

    it('should accept a snitch id', function () {
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
      var error = function () {
        client.createSnitch();
      };

      expect(error).toThrowError('Missing snitch');
    });

    it('should error when non-snitch object given', function () {
      var error = function () {
        client.createSnitch({});
      };

      expect(error).toThrowError('Invalid snitch');
    });

    it('should accept a snitch object', function () {
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

      expect(error).toThrowError('Missing snitch');
    });

    it('should error when non-snitch object given', function () {
      var error = function () {
        client.editSnitch({});
      };

      expect(error).toThrowError('Invalid snitch');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.editSnitch(snitch);
      };

      expect(error).toThrowError('Cannot edit a snitch without a token');
    });

    it('should accept a snitch object', function () {
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

  describe('addTags', function () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.addTags();
      };

      expect(error).toThrowError('Missing snitch');
    });

    it('should error when non-snitch object given', function () {
      var error = function () {
        client.addTags({});
      };

      expect(error).toThrowError('Invalid snitch');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.addTags(snitch);
      };

      expect(error).toThrowError('Missing token');
    });

    it('should error when no tags given', function () {
      var error = function () {
        client.addTags('abc123');
      };

      expect(error).toThrowError('Missing tags');
    });

    it('should error when invalid tags given', function () {
      var error = function () {
        client.addTags('abc123', {});
      };

      expect(error).toThrowError('Invalid tags');
    });

    it('should error when empty tags given', function () {
      var error = function () {
        client.addTags('abc123', []);
      };

      expect(error).toThrowError('Invalid tags');
    });

    it('should accept a token and tags', function () {
      client.addTags('c2354d53d2', ['production']);
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/c2354d53d2/tags', ['production']);
    });

    it('should accept a snitch object and tags', function () {
      var snitch = new Snitch({
        name: 'Hello',
        interval: '15_minute'
      });
      snitch.token = 'c2354d53d2';
      client.addTags(snitch, ['production']);
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/c2354d53d2/tags', ['production']);
    });
  });

  describe('removeTag', function () {

  });

  describe('pauseSnitch', function () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.pauseSnitch();
      };

      expect(error).toThrowError('Missing snitch');
    });

    it('should error when non-snitch object given', function () {
      var error = function () {
        client.pauseSnitch({});
      };

      expect(error).toThrowError('Invalid snitch');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.pauseSnitch(snitch);
      };

      expect(error).toThrowError('Missing token');
    });

    it('should accept a token', function () {
      client.pauseSnitch('c2354d53d2');
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/c2354d53d2/pause');
    });

    it('should accept a snitch object', function () {
      var snitch = new Snitch({
        name: 'Hello',
        interval: '15_minute'
      });
      snitch.token = 'c2354d53d2';
      client.pauseSnitch(snitch);
      expect(client.makeRequest).toHaveBeenCalledWith('POST', '/snitches/c2354d53d2/pause');
    });
  });

  describe('deleteSnitch', function () {
    it('should error when no snitch given', function () {
      var error = function () {
        client.deleteSnitch();
      };

      expect(error).toThrowError('Missing snitch');
    });

    it('should error when non-snitch given', function () {
      var error = function () {
        client.deleteSnitch({});
      };

      expect(error).toThrowError('Invalid snitch');
    });

    it('should error when snitch has no token', function () {
      var error = function () {
        var snitch = new Snitch({
          name: 'Hello',
          interval: '15_minute'
        });
        client.deleteSnitch(snitch);
      };

      expect(error).toThrowError('Missing token');
    });

    it('should accept a snitch id', function () {
      client.deleteSnitch('c2354d53d2');
      expect(client.makeRequest).toHaveBeenCalledWith('DELETE', '/snitches/c2354d53d2');
    });

    it('should accept a snitch object', function () {
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
