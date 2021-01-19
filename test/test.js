const assert = require('assert');
const AvailabilityUtil = require('../availability');

const Availability = new AvailabilityUtil();

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

  describe('Same day, available: 9hs to 13hs, 14hs to 18hs', () => {
    it('should return 28800 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T09:00:00.000+0000'),
        new Date('2021-01-01T19:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800],
              [50400, 64800],
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 28800);
    });
  });

  describe('Same day, available: 9hs to 13hs, 14hs to 18hs', () => {
    it('should return 18000 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T09:00:00.000+0000'),
        new Date('2021-01-01T15:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800],
              [50400, 64800],
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 18000);
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
      assert.strictEqual(totalSeconds, 'Error: la fecha final debe ser mayor a la fecha inicial');
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
      assert.strictEqual(totalSeconds, 'Error: la fecha final debe ser mayor a la fecha inicial');
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
          },
        ],
      );
      assert.strictEqual(totalSeconds, 'Error: El formato o longitud de la configuracion de disponibilidad es incorrecto');
    });
  });

  describe('1 day, two ranges', () => {
    it('should return 28800', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T04:00:00.000+0000'),
        new Date('2021-01-01T19:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 28800);
    });
  });

  describe('1 day, two ranges', () => {
    it('should return 3600', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T12:00:00.000+0000'),
        new Date('2021-01-01T13:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 3600);
    });
  });

  describe('1 day, two ranges, wrong ranges', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T12:00:00.000+0000'),
        new Date('2021-01-01T15:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [46800, 32400], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 'Error: uno de los rangos esta mal definido');
    });
  });

  describe('1 day, closed', () => {
    it('should return 0', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T12:00:00.000+0000'),
        new Date('2021-01-01T15:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [46800, 32400], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
            closed: true,
          },
        ],
      );
      assert.strictEqual(totalSeconds, 0);
    });
  });

  describe('1 day, full availability', () => {
    it('should return 0', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T12:00:00.000+0000'),
        new Date('2021-01-01T15:00:00.000+0000'),
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

  describe('2 days, no match time', () => {
    it('should return 0', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T20:00:00.000+0000'),
        new Date('2021-01-02T00:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 0);
    });
  });

  describe('2 days, match only one range', () => {
    it('should return 14000', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T20:00:00.000+0000'),
        new Date('2021-01-02T14:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
          {
            day: 6,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 14400);
    });
  });

  describe('2 days, wrong range', () => {
    it('should return error', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T20:00:00.000+0000'),
        new Date('2021-01-02T14:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
          {
            day: 6,
            ranges: [
              [46800, 32400], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 'Error: uno de los rangos esta mal definido');
    });
  });

  describe('2 days, last day full availability', () => {
    it('should return 86400', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-01T20:00:00.000+0000'),
        new Date('2021-01-02T14:00:00.000+0000'),
        [
          {
            day: 5,
            ranges: [
              [32400, 46800], // 9.00hs a 13.00hs (4 hours)
              [50400, 64800], // 14.00hs a 18.00hs (4 hours)
            ],
          },
          {
            day: 6,
            ranges: [],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 86400);
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

  describe('3 days, different availabilities', () => {
    it('should return 93600 seconds', () => {
      const totalSeconds = Availability.getAvailableSeconds(
        new Date('2021-01-11T12:00:00.000+0000'),
        new Date('2021-01-13T10:00:00.000+0000'),
        [
          {
            day: 1,
            ranges: [[32400, 46800]],
          },
          {
            day: 2,
            ranges: [],
          },
          {
            day: 3,
            ranges: [[32400, 46800]],
          },
        ],
      );
      assert.strictEqual(totalSeconds, 93600);
    });
  });
});
