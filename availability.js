const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);
const validator = require('jsonschema').validate;

class Availability {
  getDaysBetweenDates(fromDate, toDate) {
    const days = {};
    let currentDate = fromDate.add(1, 'days');
    while (currentDate.isBefore(toDate)) {
      const weekday = currentDate.day();
      if (days[weekday]) {
        days[weekday] += 1;
      } else {
        days[weekday] = 1;
      }
      currentDate = currentDate.add(1, 'days');
    }

    return days;
  }

  getSecondsFromRange(ranges) {
    return ranges.reduce((acc, elm) => (elm[1] > elm[0] ? acc + (elm[1] - elm[0]) : undefined), 0);
  }

  getAvailabilityPerDay(availabilityConfig) {
    return availabilityConfig.reduce((acc, elm) => {
      if (!elm.closed) {
        acc[elm.day] = {
          total_seconds: elm.ranges
            .length ? this.getSecondsFromRange(elm.ranges) : 86400,
          ranges: elm.ranges,
        };
      } else {
        acc[elm.day] = {
          total_seconds: 0,
          ranges: elm.ranges,
          closed: true,
        };
      }

      return acc;
    }, {});
  }

  getAvailabilityFirstAndLastDay(fromDate, toDate, availabilityPerDay) {
    const fromWeekday = fromDate.day();
    const fromSeconds = fromDate.hour() * 60 * 60 + fromDate.minute() * 60 + fromDate.second();
    const toWeekday = toDate.day();
    const toSeconds = toDate.hour() * 60 * 60 + toDate.minute() * 60 + toDate.second();
    // console.log(fromSeconds, fromWeekday);

    if (fromDate.isSame(toDate, 'day')) {
      if (!availabilityPerDay[toWeekday].closed) {
        return availabilityPerDay[toWeekday].ranges.length
          ? availabilityPerDay[toWeekday].ranges.reduce((acc, elm) => {
            if (elm[1] > elm[0]) {
              if (fromSeconds <= elm[0] && toSeconds >= elm[1]) {
                return acc + (elm[1] - elm[0]);
              }
              if (fromSeconds < elm[0] && toSeconds > elm[0] && toSeconds < elm[1]) {
                return acc + (toSeconds - elm[0]);
              }
              if (fromSeconds > elm[0] && fromSeconds < elm[1] && toSeconds >= elm[0]) {
                return acc + (elm[1] - fromSeconds);
              }
              return acc;
            }

            return undefined;
          }, 0) : 86400;
      }
      return 0;
    }

    let totalFromDate = 0;
    if (!availabilityPerDay[fromWeekday].closed) {
      totalFromDate = availabilityPerDay[fromWeekday].ranges.length
        ? availabilityPerDay[fromWeekday].ranges.reduce((acc, elm) => {
          if (elm[1] > elm[0]) {
            if (fromSeconds <= elm[0]) {
              return acc + (elm[1] - elm[0]);
            }
            if (fromSeconds > elm[0] && fromSeconds < elm[1]) {
              return acc + (elm[1] - fromSeconds);
            }

            return acc;
          }
          return undefined;
        }, 0) : 86400;
    }

    let totaltoDate = 0;
    if (availabilityPerDay[toWeekday] && !availabilityPerDay[toWeekday].closed) {
      totaltoDate = availabilityPerDay[toWeekday].ranges.length
        ? availabilityPerDay[toWeekday].ranges.reduce((acc, elm) => {
          if (elm[1] > elm[0]) {
            if (toSeconds >= elm[1]) {
              return acc + (elm[1] - elm[0]);
            }
            if (toSeconds > elm[0] && toSeconds < elm[1]) {
              return acc + (toSeconds - elm[0]);
            }

            return acc;
          }
          return undefined;
        }, 0) : 86400;
    }

    return totalFromDate + totaltoDate;
  }

  validateParameters(fromDate, toDate, availabilityConfig) {
    const fromDateJs = dayjs(fromDate).isValid() ? dayjs.utc(fromDate) : null;
    const toDateJs = dayjs(toDate).isValid() ? dayjs.utc(toDate) : null;
    let availabilityLength = 0;
    if (fromDateJs && toDateJs) {
      const totalDays = toDateJs.diff(fromDateJs, 'day');
      availabilityLength = totalDays <= 7 ? totalDays : 7;
    }
    const arraySchema = {
      type: 'array',
      items: {
        properties: {
          day: { type: 'number' },
          ranges: { type: 'array', items: { type: 'array', items: { type: 'numbers' } } },
          closed: { type: 'boolean' },
        },
        required: ['day', 'ranges'],
      },
      minItems: availabilityLength,
    };
    const validAvailability = validator(availabilityConfig, arraySchema);
    let error = null;

    if (!fromDateJs || !toDateJs) {
      error = 'Error: El formato de la fecha de entrada no es valido';
    } else if (fromDateJs.isAfter(toDateJs) || fromDateJs.isSame(toDateJs)) {
      error = 'Error: la fecha final debe ser mayor a la fecha inicial';
    } else if (!validAvailability.valid) {
      error = 'Error: El formato o longitud de la configuracion de disponibilidad es incorrecto';
    }

    return {
      fromDateJs, toDateJs, config: availabilityConfig, error,
    };
  }

  getAvailableSeconds(fromDate, toDate, availabilityConfig) {
    const {
      fromDateJs, toDateJs, config, error,
    } = this.validateParameters(fromDate, toDate, availabilityConfig);

    if (error) {
      return error;
    }

    const weekdaysBeetweenDates = this.getDaysBetweenDates(fromDateJs, toDateJs);
    const availabilityPerDay = this.getAvailabilityPerDay(config);
    const firstAndLastDayAvailability = this.getAvailabilityFirstAndLastDay(
      fromDateJs, toDateJs, availabilityPerDay,
    );
    const response = Object.keys(weekdaysBeetweenDates).length
      ? Object.keys(weekdaysBeetweenDates).reduce((acc, elm) => acc
        + (weekdaysBeetweenDates[elm] * availabilityPerDay[elm].total_seconds), 0) : 0;

    return !Number.isNaN(response) && !Number.isNaN(firstAndLastDayAvailability)
      ? response + firstAndLastDayAvailability : 'Error: uno de los rangos esta mal definido';
  }
}
module.exports = Availability;
