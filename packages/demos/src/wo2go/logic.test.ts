import { describe, expect, it } from 'vitest';
import {
  aggregateByDestination,
  classifyStation,
  filterDestinations,
  type Departure,
  type Destination,
} from './logic';

const ORIGIN = 'origin-1';

function departure(overrides: Partial<Departure> & Pick<Departure, 'tripId'>): Departure {
  return {
    when: '2026-01-01T10:00:00+01:00',
    direction: null,
    line: { name: 'RE 1', product: 'regionalExp' },
    stopovers: [],
    ...overrides,
  };
}

describe('aggregateByDestination', () => {
  it('dedupes a destination reachable by two trains and keeps the fastest time', () => {
    const trainA = departure({
      tripId: 'a',
      when: '2026-01-01T10:00:00+01:00',
      line: { name: 'RE 1', product: 'regionalExp' },
      stopovers: [
        { stop: { id: ORIGIN, name: 'Berlin Hbf' }, arrival: null },
        { stop: { id: 'dest-1', name: 'Hamburg Hbf' }, arrival: '2026-01-01T11:30:00+01:00' },
      ],
    });
    const trainB = departure({
      tripId: 'b',
      when: '2026-01-01T10:15:00+01:00',
      line: { name: 'ICE 5', product: 'nationalExpress' },
      stopovers: [
        { stop: { id: ORIGIN, name: 'Berlin Hbf' }, arrival: null },
        { stop: { id: 'dest-1', name: 'Hamburg Hbf' }, arrival: '2026-01-01T11:15:00+01:00' },
      ],
    });

    const result = aggregateByDestination([trainA, trainB], ORIGIN);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('dest-1');
    expect(result[0].fastestMinutes).toBe(60); // trainB: 10:15 -> 11:15
    expect(result[0].connectionCount).toBe(2);
    expect(result[0].products.sort()).toEqual(['nationalExpress', 'regionalExp']);
  });

  it('ignores stopovers before the origin', () => {
    const train = departure({
      tripId: 'a',
      when: '2026-01-01T10:00:00+01:00',
      stopovers: [
        { stop: { id: 'before-1', name: 'Should be ignored' }, arrival: '2026-01-01T09:30:00+01:00' },
        { stop: { id: ORIGIN, name: 'Berlin Hbf' }, arrival: null },
        { stop: { id: 'dest-1', name: 'Hamburg Hbf' }, arrival: '2026-01-01T11:00:00+01:00' },
      ],
    });

    const result = aggregateByDestination([train], ORIGIN);

    expect(result).toHaveLength(1);
    expect(result.find((d) => d.id === 'before-1')).toBeUndefined();
    expect(result[0].id).toBe('dest-1');
  });

  it('skips departures with no stopovers or no departure time', () => {
    const noStopovers = departure({ tripId: 'a', stopovers: undefined });
    const noWhen = departure({
      tripId: 'b',
      when: null,
      stopovers: [
        { stop: { id: ORIGIN, name: 'Berlin Hbf' }, arrival: null },
        { stop: { id: 'dest-1', name: 'Hamburg Hbf' }, arrival: '2026-01-01T11:00:00+01:00' },
      ],
    });

    expect(aggregateByDestination([noStopovers, noWhen], ORIGIN)).toEqual([]);
  });

  it('sorts destinations by fastest travel time ascending', () => {
    const train = departure({
      tripId: 'a',
      when: '2026-01-01T10:00:00+01:00',
      stopovers: [
        { stop: { id: ORIGIN, name: 'Berlin Hbf' }, arrival: null },
        { stop: { id: 'far', name: 'Far Station' }, arrival: '2026-01-01T13:00:00+01:00' },
        { stop: { id: 'near', name: 'Near Station' }, arrival: '2026-01-01T10:30:00+01:00' },
      ],
    });

    const result = aggregateByDestination([train], ORIGIN);

    expect(result.map((d) => d.id)).toEqual(['near', 'far']);
  });
});

describe('classifyStation', () => {
  it('flags a station with "Hbf" in its name as isHbf and isMajor', () => {
    expect(classifyStation('Hamburg Hbf', new Set(['regional']))).toEqual({
      isHbf: true,
      isMajor: true,
    });
  });

  it('flags a non-Hbf station served by ICE as isMajor but not isHbf', () => {
    expect(classifyStation('Berlin Gesundbrunnen', new Set(['nationalExpress']))).toEqual({
      isHbf: false,
      isMajor: true,
    });
  });

  it('does not flag a small regional-only station as major', () => {
    expect(classifyStation('Kleinmachnow', new Set(['regional']))).toEqual({
      isHbf: false,
      isMajor: false,
    });
  });
});

describe('filterDestinations', () => {
  const destinations: Destination[] = [
    {
      id: 'regional-stop',
      name: 'Kleinmachnow',
      fastestMinutes: 20,
      connectionCount: 4,
      products: ['regional'],
      isHbf: false,
      isMajor: false,
    },
    {
      id: 'ice-hub',
      name: 'Hamburg Hbf',
      fastestMinutes: 90,
      connectionCount: 8,
      products: ['nationalExpress'],
      isHbf: true,
      isMajor: true,
    },
    {
      id: 'ic-only',
      name: 'Some City',
      fastestMinutes: 60,
      connectionCount: 2,
      products: ['national'],
      isHbf: false,
      isMajor: false,
    },
  ];

  it('regionalOnly keeps only destinations with a regional-eligible product', () => {
    const result = filterDestinations(destinations, {
      regionalOnly: true,
      majorStationsOnly: false,
      highSpeedOnly: false,
    });

    expect(result.map((d) => d.id)).toEqual(['regional-stop']);
  });

  it('majorStationsOnly keeps only isMajor destinations', () => {
    const result = filterDestinations(destinations, {
      regionalOnly: false,
      majorStationsOnly: true,
      highSpeedOnly: false,
    });

    expect(result.map((d) => d.id)).toEqual(['ice-hub']);
  });

  it('highSpeedOnly keeps only destinations served by IC or ICE', () => {
    const result = filterDestinations(destinations, {
      regionalOnly: false,
      majorStationsOnly: false,
      highSpeedOnly: true,
    });

    expect(result.map((d) => d.id).sort()).toEqual(['ic-only', 'ice-hub']);
  });

  it('returns everything when no filters are active', () => {
    const result = filterDestinations(destinations, {
      regionalOnly: false,
      majorStationsOnly: false,
      highSpeedOnly: false,
    });

    expect(result).toHaveLength(3);
  });
});
