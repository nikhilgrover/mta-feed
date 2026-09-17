import { transit_realtime } from 'gtfs-realtime-bindings';
import { Station } from '../data/stations';
import { STOP_NAME_MAP } from '../data/stopNames';
import { 
  getFeedsForRoutes, 
  MTA_BASE_URL, 
  MTA_FEED_ENDPOINTS, 
  MTA_ALERTS_ENDPOINT, 
  FeedKey 
} from '../constants/routes';

export interface SubwayArrival {
  id: string;
  tripId: string;
  routeId: string;
  destination: string;
  direction: 'N' | 'S';
  directionLabel: string;
  arrivalTime: number; // Unix epoch seconds
  minutesAway: number;
  secondsAway: number;
  isArriving: boolean;
  isDelayed: boolean;
  delaySeconds: number;
  statusText: string;
  stopSequence?: number;
}

export interface SubwayAlert {
  id: string;
  routeIds: string[];
  headerText: string;
  descriptionText: string;
  alertType: string;
  activePeriod?: { start?: number; end?: number };
}

export interface StationArrivalsResult {
  stationId: string;
  stationName: string;
  arrivals: SubwayArrival[];
  northbound: SubwayArrival[];
  southbound: SubwayArrival[];
  alerts: SubwayAlert[];
  fetchedAt: number;
}

// In-memory feed cache to prevent flooding MTA APIs
interface CachedFeed {
  data: transit_realtime.FeedMessage;
  timestamp: number;
}

const feedCache = new Map<string, CachedFeed>();
const CACHE_TTL_MS = 12_000; // 12 seconds cache TTL

/**
 * Fetch a feed with fallback: try dev proxy first, fallback to direct MTA endpoint with CORS
 */
async function fetchProtobufFeed(feedKey: FeedKey): Promise<transit_realtime.FeedMessage> {
  const endpoint = MTA_FEED_ENDPOINTS[feedKey];
  const now = Date.now();

  const cached = feedCache.get(feedKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Attempt proxy endpoint if on localhost, otherwise direct
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlsToTry = isDev 
    ? [`/mta-feed/${endpoint}`, `${MTA_BASE_URL}${endpoint}`]
    : [`${MTA_BASE_URL}${endpoint}`, `/mta-feed/${endpoint}`];

  let lastError: any = null;
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/x-protobuf, application/octet-stream, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`MTA Feed HTTP ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
      feedCache.set(feedKey, { data: feed, timestamp: now });
      return feed;
    } catch (err) {
      lastError = err;
      // Try next url
    }
  }

  // If both failed but we have a stale cache, return it
  if (cached) {
    console.warn(`Feed fetch failed, using stale cache for ${feedKey}:`, lastError);
    return cached.data;
  }

  throw lastError || new Error(`Failed to fetch GTFS-RT feed: ${feedKey}`);
}

/**
 * Fetch live service alerts from MTA
 */
export async function fetchSubwayAlerts(routes: string[]): Promise<SubwayAlert[]> {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlsToTry = isDev 
    ? [`/mta-feed/${MTA_ALERTS_ENDPOINT}`, `${MTA_BASE_URL}${MTA_ALERTS_ENDPOINT}`]
    : [`${MTA_BASE_URL}${MTA_ALERTS_ENDPOINT}`, `/mta-feed/${MTA_ALERTS_ENDPOINT}`];

  let alertsData: any = null;
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        alertsData = await response.json();
        break;
      }
    } catch {
      // Continue to next URL
    }
  }

  if (!alertsData?.entity) {
    return [];
  }

  const routeSet = new Set(routes.map(r => r.toUpperCase()));
  const matchingAlerts: SubwayAlert[] = [];

  for (const entity of alertsData.entity) {
    if (!entity.alert) continue;
    const alert = entity.alert;
    const informedEntities = alert.informed_entity || [];
    
    const affectedRoutes: string[] = [];
    let matchesOurStation = false;

    for (const ie of informedEntities) {
      if (ie.route_id) {
        affectedRoutes.push(ie.route_id);
        if (routeSet.has(ie.route_id.toUpperCase())) {
          matchesOurStation = true;
        }
      }
    }

    if (matchesOurStation && alert.header_text?.translation?.length) {
      const header = alert.header_text.translation[0]?.text || '';
      const desc = alert.description_text?.translation?.[0]?.text || '';
      const alertType = alert['transit_realtime.mercury_alert']?.alert_type || 'Service Notice';
      const period = alert.active_period?.[0];

      matchingAlerts.push({
        id: entity.id,
        routeIds: Array.from(new Set(affectedRoutes)),
        headerText: header,
        descriptionText: desc,
        alertType,
        activePeriod: period,
      });
    }
  }

  return matchingAlerts;
}

/**
 * Helper to resolve numeric unix timestamp from protobuf representation
 */
function toEpochSeconds(time: any): number {
  if (!time) return 0;
  if (typeof time === 'number') return time;
  if (typeof time === 'string') return parseInt(time, 10);
  if (typeof time === 'object' && 'low' in time) return time.low;
  return Number(time) || 0;
}

/**
 * Extract clean terminal destination name from stopId
 */
function resolveTerminalName(stopId?: string | null, fallbackRoute?: string): string {
  if (!stopId) {
    return fallbackRoute ? `${fallbackRoute} Train` : 'Upcoming Subway';
  }

  // Check direct exact match in STOP_NAME_MAP
  if (STOP_NAME_MAP[stopId]) {
    return STOP_NAME_MAP[stopId];
  }

  // Try stripping direction suffix (N or S)
  const baseStopId = stopId.replace(/[NS]$/, '');
  if (STOP_NAME_MAP[baseStopId]) {
    return STOP_NAME_MAP[baseStopId];
  }

  return fallbackRoute ? `${fallbackRoute} Terminus` : 'Subway';
}

/**
 * Fetch and assemble real-time arrivals for a selected station
 */
export async function fetchArrivalsForStation(
  station: Station,
  targetStopIds?: string[]
): Promise<StationArrivalsResult> {
  const feedKeys = getFeedsForRoutes(station.routes);
  const stopIdsToMatch = new Set<string>(
    targetStopIds && targetStopIds.length > 0
      ? targetStopIds
      : (station.stopIds && station.stopIds.length > 0 ? station.stopIds : [station.id])
  );

  const nowEpoch = Math.floor(Date.now() / 1000);

  // Fetch all required feeds in parallel
  const feedPromises = feedKeys.map(key => 
    fetchProtobufFeed(key).catch(err => {
      console.warn(`Error fetching feed ${key}:`, err);
      return null;
    })
  );

  // Also fetch service alerts in parallel
  const alertsPromise = fetchSubwayAlerts(station.routes).catch(() => []);

  const [feedResults, alerts] = await Promise.all([
    Promise.all(feedPromises),
    alertsPromise,
  ]);

  const rawArrivals: SubwayArrival[] = [];

  for (const feed of feedResults) {
    if (!feed?.entity) continue;

    for (const entity of feed.entity) {
      const tripUpdate = entity.tripUpdate;
      if (!tripUpdate?.stopTimeUpdate || !tripUpdate.trip) continue;

      const trip = tripUpdate.trip;
      const routeId = trip.routeId || '';
      const tripId = trip.tripId || entity.id;
      const updates = tripUpdate.stopTimeUpdate;

      // Find final stop for destination headsign
      const lastUpdate = updates[updates.length - 1];
      const destination = resolveTerminalName(lastUpdate?.stopId, routeId);

      for (const update of updates) {
        const fullStopId = update.stopId || '';
        const baseStopId = fullStopId.replace(/[NS]$/, '');

        if (stopIdsToMatch.has(baseStopId) || stopIdsToMatch.has(fullStopId)) {
          // Direction determined by suffix (N or S) or trip direction
          const dirChar = fullStopId.endsWith('N') ? 'N' : (fullStopId.endsWith('S') ? 'S' : (trip.directionId === 0 ? 'N' : 'S'));
          
          const timeObj = update.arrival?.time || update.departure?.time;
          const arrivalEpoch = toEpochSeconds(timeObj);

          if (!arrivalEpoch) continue;

          const secondsAway = arrivalEpoch - nowEpoch;

          // Exclude trains that departed > 60 seconds ago or > 180 minutes out
          if (secondsAway < -60 || secondsAway > 180 * 60) continue;

          const minutesAway = Math.max(0, Math.round(secondsAway / 60));
          const isArriving = secondsAway <= 60 && secondsAway >= -30;
          const delaySec = update.arrival?.delay || 0;
          const isDelayed = delaySec > 180; // 3+ mins delayed

          let statusText = 'Approaching';
          if (isArriving) {
            statusText = 'ARR';
          } else if (minutesAway === 0) {
            statusText = '< 1 min';
          } else {
            statusText = `${minutesAway} min`;
          }

          const directionLabel = dirChar === 'N' 
            ? station.northLabel 
            : station.southLabel;

          rawArrivals.push({
            id: `${tripId}_${fullStopId}`,
            tripId,
            routeId,
            destination,
            direction: dirChar,
            directionLabel,
            arrivalTime: arrivalEpoch,
            minutesAway,
            secondsAway,
            isArriving,
            isDelayed,
            delaySeconds: delaySec,
            statusText,
            stopSequence: update.stopSequence || 0,
          });
        }
      }
    }
  }

  // Sort arrivals strictly by chronological arrival time
  rawArrivals.sort((a, b) => a.secondsAway - b.secondsAway);

  // Group into Northbound and Southbound
  const northbound = rawArrivals.filter(a => a.direction === 'N');
  const southbound = rawArrivals.filter(a => a.direction === 'S');

  return {
    stationId: station.id,
    stationName: station.name,
    arrivals: rawArrivals,
    northbound,
    southbound,
    alerts,
    fetchedAt: Date.now(),
  };
}
