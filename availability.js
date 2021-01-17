const dayjs = require('dayjs');
const validator = require('jsonschema').validate;

class Availability {
  getDaysBetweenDates(fromDate, toDate) {
    const days = {};
    let currentDate = fromDate;
    while (currentDate.isBefore(toDate)) {
      currentDate = currentDate.add(1, 'days');
      const weekday = currentDate.day();
      if (days[weekday]) {
        days[weekday] += 1;
      } else {
        days[weekday] = 1;
      }
    }

    return days;
  }

  getSecondsFromRange(ranges) {
    return ranges.reduce((acc, elm) => elm[1] > elm[0] ? acc + (elm[1] - elm[0]) : undefined, 0);
  }

  getAvailabilityPerDay(availabilityConfig) {
    return availabilityConfig.reduce((acc, elm) => {
      if (!elm.closed) {
        acc[elm.day] = elm.ranges.length ? this.getSecondsFromRange(elm.ranges): 86400;
      } else {
        acc[elm.day] = 0;
      }

      return acc;
    }, {});
  }

  validateParameters(fromDate, toDate, availabilityConfig) {
    const fromDateJs = dayjs(fromDate).isValid() ? dayjs(fromDate) : null;
    const toDateJs = dayjs(toDate).isValid() ? dayjs(toDate) : null;
    let availabilityLength = 0
    if (fromDateJs && toDateJs) {
      const totalDays = toDateJs.diff(fromDateJs, 'day')
      availabilityLength = totalDays <= 7 ? totalDays : 7 
    }
    var arraySchema = {
      type: "array",
      items: {
        properties: {
          "day": { type: "number" },
          "ranges": { type: "array", items: { type: "array", items: {type: "numbers"} } },
          "closed": { "type": "boolean" }
        },
        required: ["day", "ranges"]
      },
      minItems: availabilityLength
    }
    const validAvailability = validator(availabilityConfig, arraySchema)
    console.log(availabilityLength, validAvailability.valid)
    let error = null;

    if (!fromDateJs || !toDateJs) {
      error = 'Error: El formato de la fecha de entrada no es valido';
    } else if (fromDateJs.isAfter(toDateJs) || toDateJs.diff(fromDateJs, 'd') < 1) {
      error = 'Error: la fecha final debe ser mayor a la fecha inicial, y debe haber al menos un dia de diferencia.';
    } else if (!validAvailability.valid){
      error = 'Error: El formato o longitud de la configuracion de disponibilidad es incorrecto'
    }

    return { fromDateJs, toDateJs, config: availabilityConfig, error };
  }

  getAvailableSeconds(fromDate, toDate, availabilityConfig) {
    const { fromDateJs, toDateJs, config, error } = this.validateParameters(fromDate, toDate, availabilityConfig);
    if (error) {
      return error;
    }

    const weekdaysBeetweenDates = this.getDaysBetweenDates(fromDateJs, toDateJs);
    const availabilityPerDay = this.getAvailabilityPerDay(config);
    const response = Object.keys(weekdaysBeetweenDates)
      .reduce((acc, elm) => acc + (weekdaysBeetweenDates[elm] * availabilityPerDay[elm]), 0);

    return !Number.isNaN(response) ? response : 'Error: uno de los rangos esta mal definido';
  }
}
module.exports = Availability;
