# Get Available Seconds

Get Available Seconds is a exercise  function that allows to get the time available (in seconds) between two dates, taking in account a configuration with rules.

The function getAvailableSeconds receive these parameters as input:

##### fromDate: 
a date object to use as start to calculate the time available. Could be null, undefined or invalid. Example:
```javascript
new Date("2021-01-07T00:00:00.000+0000")
```

##### toDate: 
a date object to use as end to calculate the time available. Could be null, undefined or invalid. Example:
```javascript
new Date("2021-01-08T00:00:00.000+0000")
```


##### availabilityConfig: 

- An array with availability ranges of time for each day of a week:
- Each day can have none, one or multiple ranges of time.
- Each range of time will have the hour when it starts and when it ends.
- Each hour is expressed in seconds, from the beginning of the day (1 second) to the end of the day (24 hours = 86400 seconds)
- One or more days can be closed, but with range time defined (or not)
```javascript
[
   // monday, available all day (no hours defined)
   {
  	"day": 1,
  	"ranges":[ ]
   },
   // tuesday, available from: 9hs to 18hs
   {
  	"day": 2,
  	"ranges":[ [ 32400, 64800] ]
   },
   // wednesday, available from: 9hs to 12hs, 14hs to 17hs
   {
  	"day": 3,
  	"ranges":[ [ 32400, 43200 ], [50400, 61200] ]
   },
   // thursday, not available (closed)
   {
  	"day": 4,
  	"ranges":[ [ 32400, 64800 ] ],
      "closed": true
   },
   // friday, available: 14hs to 17hs
   {
  	"day": 5,
  	"ranges":[ [50400, 61200] ]
   },
   // saturday, not available (closed)
   {
  	"day": 6,
  	"ranges": [ ],
      "closed": true
   },
   // sunday, not available (closed)
   {
  	"day": 0,
  	"ranges": [ ],
      "closed": true
   },
]
```

### Tech

Get Available Seconds exercise uses a number of dependencies to work properly:

* [Dayjs](https://day.js.org/) - Fast 2kB alternative to Moment.js with the same modern API
* [Mocha](https://mochajs.org/) - Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.
* [nyc](https://github.com/istanbuljs/nyc) - Istanbul instruments your ES5 and ES2015+ JavaScript code with line counters, so that you can track how well your unit-tests exercise your codebase.
* [Eslint](https://eslint.org/docs/developer-guide/nodejs-api) - ESLint statically analyzes your code to quickly find problems
* [node.js] - evented I/O for the backend

### Installation

Install the dependencies and devDependencies and run the tests.

```sh
$ npm i
$ npm run test
```

The test validate several cases:

- Range of a Day empty - full availability
- Day with only one range
- Day with multiple ranges
- One day closed
- FromDate and toDate are the same
- Less than one day of difference between fromData and toDate
- ToDate before fromDate
- Dates are null, undefined, or invalid
- Invalid range
- Multiples day with correct dates and availability


