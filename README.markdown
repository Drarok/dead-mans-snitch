# Dead Man's Snitch

This package provides a node.js library for talking to [Dead Man's Snitch](https://deadmanssnitch.com).

All methods return a [Promise](http://wiki.commonjs.org/wiki/Promises/A), so you should be familiar with them before making use of this library.

## Usage

### Create an API client instance

```js
var DeadMansSnitch = require('dead-mans-snitch');
var client = new DeadMansSnitch.APIClient('YOUR-SECRET-API-KEY');
```

### Get all snitches on your account

```js
client.getSnitches()
  .then(function (arrayOfSnitches) {
    // …
  });
```

### Get detail on a single snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    return client.getSnitch(snitch);
  }).then(function (snitchDetail) {
    // …
  });
```

OR

```js
return client.getSnitch('abc123')
  then(function (snitch) {
    // …
  });
```

### Creating a new snitch

```js
var snitch = new DeadMansSnitch.Snitch({
  name: 'Test Snitch',
  interval: '15_minute'
  notes: 'Optional notes about this snitch',
  tags: ['optional_tags', 'production', 'backups']
});

client.createSnitch(snitch)
  .then(function (newSnitch) {
    console.log('Created', newSnitch.token);
  });
```

### Editing a snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    snitch.notes = 'This is now using the new version of Backup';
    return client.editSnitch(snitch);
  }).then(function (snitch) {
    console.log('Edited', snitch.token);
  });
```

### Adding one or more tags to a snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    return client.addTags(snitch, ['production', 'backup'])
  }).then(function (tags) {
    console.log('Snitch now has tags', tags);
  });
```

OR

```js
client.addTags('abc123', ['production', 'backup'])
  .then(function (tags) {
    console.log('Snitch now has tags', tags);
  });
```

### Removing a tag from a snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    return client.removeTag(snitch, 'production')
  }).then(function () {
    console.log('Removed!');
  });
```

OR

```js
client.removeTag('abc123', 'production')
  .then(function () {
    console.log('Removed!');
  });
```

### Changing tags on a snitch

To replace all the tags on a snitch, use `client.editSnitch()`:

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    snitch.tags = ['production', 'backup'];
    return client.editSnitch(snitch);
  }).then(function (snitch) {
    console.log('Edited', snitch.token);
  });
```

### Pausing a snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    return client.pauseSnitch(snitch);
  }).then(function () {
    console.log('Paused');
  });
```

OR

```js
client.pauseSnitch('abc123')
  .then(function () {
    console.log('Paused!');
  });
```

### Deleting a snitch

```js
fetchSnitchSomehow()
  .then(function (snitch) {
    return client.deleteSnitch(snitch);
  }).then(function () {
    console.log('Deleted!');
  });
```

OR

```js
client.deleteSnitch('abc123')
  .then(function () {
    console.log('Deleted!');
  });
```
