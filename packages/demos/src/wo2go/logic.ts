/**
 * Ported from zzaaid03/wo2go (github.com/zzaaid03/wo2go):
 *   - lib/aggregate.ts               -> aggregateByDestination
 *   - lib/station-classification.ts  -> classifyStation
 *   - lib/format.ts                  -> productColor, productLabel, productSortOrder,
 *                                        formatDuration, formatFrequency
 *   - components/destinations-client.tsx -> the REGIONAL_PRODUCTS set and the three
 *     filter predicates (regionalOnly, majorStationsOnly, highSpeedOnly), extracted
 *     here into a standalone filterDestinations function so it is unit-testable
 *     outside the client component.
 *
 * All of these are pure and framework-free in the source repo (no Next.js
 * server/client boundary, no database). This is a straight copy of the
 * algorithms. The only changes: the '@/types' import alias is inlined as local
 * type definitions, and the filter logic (previously inline in
 * DestinationsClient's .filter() call) is pulled out into filterDestinations
 * so both the demo component and the tests can call it directly.
 */

/** Product types as returned by the DB transport API */
export type Product =
  | 'nationalExpress' // ICE
  | 'national' // IC / EC
  | 'regionalExp' // RE
  | 'regional' // RB
  | 'suburban' // S-Bahn
  | 'bus'
  | 'tram'
  | 'ferry'
  | 'taxi';

/** A single stopover within a trip, as returned by the API */
export interface Stopover {
  stop: {
    id: string;
    name: string;
  };
  arrival: string | null;
}

/** A single departure from the origin station, as returned by the API */
export interface Departure {
  tripId: string;
  when: string | null;
  direction: string | null;
  line: {
    name: string;
    product: Product;
  } | null;
  stopovers?: Stopover[];
}

/**
 * Aggregated destination, represents one unique station reachable
 * from the origin, with stats computed across all matching departures.
 */
export interface Destination {
  id: string;
  name: string;
  /** Shortest travel time in minutes across all connections */
  fastestMinutes: number;
  /** Number of direct connections in the window */
  connectionCount: number;
  /** Set of product types that serve this destination */
  products: string[];
  /** Whether the station name contains "Hbf" or "Hauptbahnhof" */
  isHbf: boolean;
  /** Whether the station is considered major (Hbf or served by ICE) */
  isMajor: boolean;
}

/** Filter state managed by the demo component */
export interface Filters {
  regionalOnly: boolean;
  majorStationsOnly: boolean;
  highSpeedOnly: boolean;
}

interface ConnectionRow {
  destinationId: string;
  destinationName: string;
  travelMinutes: number;
  product: string;
}

/**
 * Classifies a station based on its name and the products serving it.
 *
 * - isHbf: true if the name contains "Hbf" or "Hauptbahnhof"
 * - isMajor: true if isHbf OR if ICE (nationalExpress) serves the station
 */
export function classifyStation(
  name: string,
  products: Set<string>
): { isHbf: boolean; isMajor: boolean } {
  const isHbf = /\bHbf\b/i.test(name) || /Hauptbahnhof/i.test(name);
  const isMajor = isHbf || products.has('nationalExpress');
  return { isHbf, isMajor };
}

/**
 * Aggregates raw departures into a list of unique destinations,
 * sorted by fastest travel time ascending.
 *
 * How it works:
 * 1. For each departure, iterate over its stopovers AFTER the origin.
 * 2. Each such stopover is a reachable destination on that trip.
 * 3. Compute travel time from origin departure to stopover arrival.
 * 4. Group by destination station ID and compute stats.
 */
export function aggregateByDestination(
  departures: Departure[],
  originId: string
): Destination[] {
  const rows: ConnectionRow[] = [];

  for (const dep of departures) {
    // Skip departures without stopovers or departure time
    if (!dep.stopovers || !dep.when) continue;

    const originTime = new Date(dep.when).getTime();
    const product = dep.line?.product;
    if (!product) continue;

    // Find the origin index in stopovers so we only look at stops AFTER it
    let pastOrigin = false;

    for (const stopover of dep.stopovers) {
      if (!pastOrigin) {
        // Check if this stopover is the origin station
        if (stopover.stop?.id === originId) {
          pastOrigin = true;
        }
        continue;
      }

      // Skip if this stopover loops back to the origin
      if (stopover.stop?.id === originId) continue;

      // Skip stopovers without arrival time
      if (!stopover.arrival) continue;

      const arrivalTime = new Date(stopover.arrival).getTime();
      const travelMinutes = Math.round((arrivalTime - originTime) / 60_000);

      // Skip negative or zero travel times (data anomalies)
      if (travelMinutes <= 0) continue;

      rows.push({
        destinationId: stopover.stop.id,
        destinationName: stopover.stop.name,
        travelMinutes,
        product,
      });
    }
  }

  // Group rows by destination ID
  const grouped = new Map<
    string,
    {
      name: string;
      minMinutes: number;
      count: number;
      products: Set<string>;
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.destinationId);
    if (existing) {
      existing.minMinutes = Math.min(existing.minMinutes, row.travelMinutes);
      existing.count += 1;
      existing.products.add(row.product);
    } else {
      grouped.set(row.destinationId, {
        name: row.destinationName,
        minMinutes: row.travelMinutes,
        count: 1,
        products: new Set([row.product]),
      });
    }
  }

  // Convert to Destination[] with station classification
  const destinations: Destination[] = [];

  for (const [id, data] of grouped) {
    const { isHbf, isMajor } = classifyStation(data.name, data.products);

    destinations.push({
      id,
      name: data.name,
      fastestMinutes: data.minMinutes,
      connectionCount: data.count,
      products: Array.from(data.products),
      isHbf,
      isMajor,
    });
  }

  // Sort by fastest travel time ascending
  destinations.sort((a, b) => a.fastestMinutes - b.fastestMinutes);

  return destinations;
}

/** Products considered "regional", eligible for Deutschlandticket */
const REGIONAL_PRODUCTS = new Set(['regionalExp', 'regional', 'suburban', 'bus', 'tram']);

/**
 * Applies the three filter toggles to a destination list.
 * Extracted from DestinationsClient's inline .filter() call in the source
 * repo so it can be exercised directly in tests and reused by the demo.
 */
export function filterDestinations(destinations: Destination[], filters: Filters): Destination[] {
  return destinations.filter((dest) => {
    if (filters.regionalOnly) {
      const hasRegional = dest.products.some((p) => REGIONAL_PRODUCTS.has(p));
      if (!hasRegional) return false;
    }
    if (filters.highSpeedOnly) {
      const hasHighSpeed = dest.products.some((p) => p === 'national' || p === 'nationalExpress');
      if (!hasHighSpeed) return false;
    }
    if (filters.majorStationsOnly) {
      if (!dest.isMajor) return false;
    }
    return true;
  });
}

/**
 * Formats a duration in minutes into a human-readable string.
 *
 * Examples:
 *  - 90  -> "1h 30m"
 *  - 60  -> "1h"
 *  - 23  -> "23 min"
 *  - 120 -> "2h"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Maps API product identifiers to user-facing badge labels.
 * These abbreviations are standard German rail nomenclature and
 * stay the same regardless of UI language.
 */
export function productLabel(product: string): string {
  const map: Record<string, string> = {
    nationalExpress: 'ICE',
    national: 'IC',
    regionalExp: 'RE',
    regional: 'RB',
    suburban: 'S',
    bus: 'Bus',
    tram: 'Tram',
    ferry: 'Ferry',
    taxi: 'Taxi',
  };
  return map[product] ?? product;
}

/**
 * Sort order for product badges, highest tier first.
 * Lower number = higher tier = appears first.
 */
export function productSortOrder(product: string): number {
  const order: Record<string, number> = {
    nationalExpress: 0,
    national: 1,
    regionalExp: 2,
    regional: 3,
    suburban: 4,
    bus: 5,
    tram: 6,
    ferry: 7,
    taxi: 8,
  };
  return order[product] ?? 9;
}

/**
 * Map product types to distinct colors used for badges and accents.
 */
export function productColor(product: string): string {
  switch (product) {
    case 'nationalExpress':
      return '#0ea5e9'; // ICE - sky
    case 'national':
      return '#ef4444'; // IC - red
    case 'regionalExp':
      return '#f97316'; // RE - orange
    case 'regional':
      return '#16a34a'; // RB - green
    case 'suburban':
      return '#14b8a6'; // S - teal
    default:
      return '#6b7280'; // muted gray
  }
}
