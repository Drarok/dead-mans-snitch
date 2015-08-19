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

APIClient.prototype.getToken = function (snitch) {
  var snitchType = typeof snitch;

  if (snitchType === 'string') {
    return snitch;
  } else if (snitchType === 'object') {
    if (!(snitch instanceof Snitch)) {
      throw new Error('Invalid snitch');
    }

    if (!snitch.token) {
      throw new Error('Missing token');
    }

    return snitch.token;
  } else {
    throw new Error('Invalid parameter type: ' + snitchType);
  }
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
    throw new Error('Missing snitch');
  }

  var token = this.getToken(snitch);

  return this.makeRequest('GET', '/snitches/' + token)
    .then(function (data) {
      return Snitch.parse(data);
    });
};

APIClient.prototype.createSnitch = function (snitch) {
  if (!snitch) {
    throw new Error('Missing snitch');
  }

  if (!(snitch instanceof Snitch)) {
    throw new Error('Invalid snitch');
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
  if (!snitch) {
    throw new Error('Missing snitch');
  }

  if (!(snitch instanceof Snitch)) {
    throw new Error('Invalid snitch');
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

APIClient.prototype.addTags = function (snitch, tags) {
  if (!snitch) {
    throw new Error('Missing snitch');
  }

  var token = this.getToken(snitch);

  if (!tags) {
    throw new Error('Missing tags');
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Invalid tags');
  }

  return this.makeRequest('POST', '/snitches/' + token + '/tags', tags);
};

APIClient.prototype.pauseSnitch = function (snitch) {
  if (!snitch) {
    throw new Error('Missing snitch');
  }

  var token = this.getToken(snitch);
  return this.makeRequest('POST', '/snitches/' + token + '/pause');
};

APIClient.prototype.deleteSnitch = function (snitch) {
  if (!snitch) {
    throw new Error('Missing snitch');
  }

  var token = this.getToken(snitch);
  return this.makeRequest('DELETE', '/snitches/' + token);
};

module.exports = APIClient;
