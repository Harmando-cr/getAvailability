const assert = require('assert');
const AvailabilityUtil = require('../availability');

const Availability = new AvailabilityUtil()

describe('Availability', () => {
  describe('One day, available all day', () => {
    it('should return 86400 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 86400);
    });
  });

  describe('One day, available: 9hs to 18hs', () => {
    it('should return 32400 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 32400);
    });
  });

  describe('One day, available: 9hs to 12hs, 14hs to 17hs', () => {
    it('should return 21600 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 43200],
              [50400, 61200],
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 21600);
    });
  });

  describe('One day, // closed', () => {
    it('should return 0 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 0);
    });
  });

  describe('One day, same date', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-01T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: la fecha final debe ser mayor a la fecha inicial, y debe haber al menos un dia de diferencia.');
    });
  });

  describe('toDate before fromDate', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-02T00:00:00.000+0000'),
        new Date('2021-01-01T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: la fecha final debe ser mayor a la fecha inicial, y debe haber al menos un dia de diferencia.');
    });
  });

  describe('less than one day', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-01T23:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: la fecha final debe ser mayor a la fecha inicial, y debe haber al menos un dia de diferencia.');
    });
  });

  describe('fromDate null', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        null,
        new Date('2021-01-01T23:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: El formato de la fecha de entrada no es valido');
    });
  });

  describe('toDate undefined', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T23:00:00.000+0000'),
        null,
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: El formato de la fecha de entrada no es valido');
    });
  });

  describe('toDate invalid', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T23:00:00.000+0000'),
        'bla',
        [
          {
            day: 5,
            ranges: [[32400, 64800]],
            closed: true,
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: El formato de la fecha de entrada no es valido');
    });
  });

  describe('wrong range', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [[64800, 32400]],
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: uno de los rangos esta mal definido');
    });
  });

  describe('invalid range type', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T00:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [{}],
          },
        ],

      );
      assert.strictEqual(totalSeconds, 'Error: El formato o longitud de la configuracion de disponibilidad es incorrecto');
    });
  });

  describe('7 days, different availabilities', () => {
    it('should return 162000 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-11T00:00:00.000+0000'),
        new Date('2021-01-18T00:00:00.000+0000'),
        [
          {
            day: 1,
            ranges: [[32400, 64800]],
          },
          {
            day: 2,
            ranges: [[32400, 64800]],
          },
          {
            day: 3,
            ranges: [[32400, 64800]],
          },
          {
            day: 4,
            ranges: [[32400, 64800]],
          },
          {
            day: 5,
            ranges: [[32400, 64800]],
          },
          {
            day: 6,
            ranges: [],
            closed: true,
          },
          {
            day: 0,
            ranges: [],
            closed: true,
          },
        ],
      );
      assert.strictEqual(totalSeconds, 162000);
    });
  });

  describe('7 days, bad availability config', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-11T00:00:00.000+0000'),
        new Date('2021-01-18T00:00:00.000+0000'),
        [
          {
            day: 1,
            ranges: [[32400, 64800]],
          },
          {
            day: 2,
            ranges: [[32400, 64800]],
          }
        ],
      );
      assert.strictEqual(totalSeconds, 'Error: El formato o longitud de la configuracion de disponibilidad es incorrecto');
    });
  });

  describe('10 days, different availabilities', () => {
    it('should return 259200 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-11T00:00:00.000+0000'),
        new Date('2021-01-21T00:00:00.000+0000'),
        [
          {
            day: 1,
            ranges: [[32400, 64800]],
          },
          {
            day: 2,
            ranges: [[32400, 64800]],
          },
          {
            day: 3,
            ranges: [[32400, 64800]],
          },
          {
            day: 4,
            ranges: [[32400, 64800]],
          },
          {
            day: 5,
            ranges: [[32400, 64800]],
          },
          {
            day: 6,
            ranges: [],
            closed: true,
          },
          {
            day: 0,
            ranges: [],
            closed: true,
          },
        ],
      );
      assert.strictEqual(totalSeconds, 259200);
    });
  });
});
