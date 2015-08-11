# Dead Man's Snitch

## Usage

```js
var DeadMansSnitch = require('dead-mans-snitch');

var client = new DeadMansSnitch.APIClient('YOUR-SECRET-API-KEY');

// Listing your existing snitches
client.getSnitches()
  .then(function (arrayOfSnitches) {
    // …
  });

// Creating a new snitch
var snitch = new DeadMansSnitch.Snitch({
  name: 'Test Snitch',
  interval: '15_minute'
  notes: 'Optional notes about this snitch',
  tags: ['optional_tags', 'production', 'backups']
});

client.createSnitch(snitch)
  .then(function (snitch) {
    console.log('Created', snitch.token);
  });


// Deleting a snitch
var snitch = fetchSnitchSomehow();


client.deleteSnitch(snitch)
  .then(function () {
    console.log('Deleted!');
  });
```
