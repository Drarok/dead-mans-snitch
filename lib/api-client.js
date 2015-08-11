'use strict';

var request = require('request-promise');
var Snitch = require('./snitch');

function APIClient(key, options) {
  if (!options) {
    options = {};
  }

  this.key = key;
  this.url = options.url || 'https://api.deadmanssnitch.com/v1';
}

APIClient.prototype.makeRequest = function (method, path, json) {
  var httpOptions = {
    auth: {
      user: this.key,
      pass: ''
    },
    method: method.toUpperCase(),
    url: this.url + path,
    transform: function (body, response) {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    }
  };

  if (json) {
    httpOptions.json = json;
  }

  return request(httpOptions);
};

APIClient.prototype.getSnitches = function (tags) {
  var path = '/snitches';

  if (Array.isArray(tags)) {
    path += '?tags=';
    path += tags.map(function (tag) {
      return encodeURIComponent(tag);
    }).join();
  }

  return this.makeRequest('GET', path)
    .then(function (data) {
      return data.map(function (datum) {
        return Snitch.parse(datum);
      });
    });
};

APIClient.prototype.getSnitch = function (snitch) {
  if (!snitch) {
    throw new Error('Missing token');
  }

  var token;
  if (snitch instanceof Snitch) {
    token = snitch.token;
  } else {
    token = snitch.toString();
  }

  return this.makeRequest('GET', '/snitches/' + token)
    .then(function (data) {
      return Snitch.parse(data);
    });
};

APIClient.prototype.createSnitch = function (snitch) {
  if (!(snitch instanceof Snitch)) {
    throw new Error('Invalid parameter');
  }

  var data = {
    name: snitch.name,
    type: {
      interval: snitch.interval
    },
    notes: snitch.notes,
    tags: snitch.tags
  };

  return this.makeRequest('POST', '/snitches', data)
    .then(function (data) {
      return Snitch.parse(data);
    });
};

APIClient.prototype.editSnitch = function (snitch) {
  if (!(snitch instanceof Snitch)) {
    throw new Error('Invalid parameter');
  }

  if (!snitch.token) {
    throw new Error('Cannot edit a snitch without a token');
  }

  var data = {
    name: snitch.name,
    type: {
      interval: snitch.interval
    },
    notes: snitch.notes,
    tags: snitch.tags
  };

  return this.makeRequest('PATCH', '/snitches/' + snitch.token, data)
    .then(function (data) {
      return Snitch.parse(data);
    });
};

APIClient.prototype.deleteSnitch = function (snitch) {
  if (!(snitch instanceof Snitch)) {
    throw new Error('Invalid parameter');
  }

  if (!snitch.token) {
    throw new Error('Cannot delete a snitch without a token');
  }

  return this.makeRequest('DELETE', '/snitches/' + snitch.token);
};

module.exports = APIClient;
