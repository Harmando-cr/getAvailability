const dayjs = require('dayjs');

function getDaysBetweenDates(fromDate, toDate) {
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

function getSecondsFromRange(ranges) {
  return ranges.reduce((acc, elm) => {
    if (elm[1] > elm[0]) {
      return acc + (elm[1] - elm[0]);
    }
    return undefined;
  }, 0);
}

function getAvailabilityPerDay(availabilityConfig) {
  return availabilityConfig.reduce((acc, elm) => {
    if (!elm.closed) {
      if (elm.ranges.length) {
        acc[elm.day] = getSecondsFromRange(elm.ranges);
      } else {
        acc[elm.day] = 86400;
      }
    } else {
      acc[elm.day] = 0;
    }

    return acc;
  }, {});
}

function validateDates(fromDate, toDate) {
  const fromDateJs = dayjs(fromDate).isValid() ? dayjs(fromDate) : null;
  const toDateJs = dayjs(toDate).isValid() ? dayjs(toDate) : null;
  let error = null;

  if (!fromDateJs || !toDateJs) {
    error = 'Error: El formato de la fecha de entrada no es valido';
  } else if (fromDateJs.isAfter(toDateJs) || toDateJs.diff(fromDateJs, 'd') < 1) {
    error = 'Error: la fecha final debe ser mayor a la fecha inicial, y debe haber al menos un dia de diferencia.';
  }

  return { fromDateJs, toDateJs, error };
}

function getAvailableSeconds(fromDate, toDate, availabilityConfig) {
  const { fromDateJs, toDateJs, error } = validateDates(fromDate, toDate);
  if (error) {
    return error;
  }

  const weekdaysBeetweenDates = getDaysBetweenDates(fromDateJs, toDateJs);
  const availabilityPerDay = getAvailabilityPerDay(availabilityConfig);
  const response = Object.keys(weekdaysBeetweenDates)
    .reduce((acc, elm) => acc + (weekdaysBeetweenDates[elm] * availabilityPerDay[elm]), 0);

  return !Number.isNaN(response) ? response : 'Error: uno de los rangos esta mal definido';
}

module.exports = { getAvailableSeconds };
