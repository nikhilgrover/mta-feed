// Official MTA Route Configurations, Colors, and Feed Mappings

export interface RouteMeta {
  id: string;
  name: string;
  longName: string;
  color: string;
  textColor: string;
  feedUrlKey: FeedKey;
  isDiamond?: boolean;
}

export type FeedKey = 
  | '1234567' 
  | 'ace' 
  | 'bdfm' 
  | 'g' 
  | 'jz' 
  | 'nqrw' 
  | 'l' 
  | 'si';

// Direct MTA feed URLs
// We also support routing through Vite proxy (/mta-feed/...) or direct depending on environment
export const MTA_FEED_ENDPOINTS: Record<FeedKey, string> = {
  '1234567': 'nyct%2Fgtfs',
  'ace': 'nyct%2Fgtfs-ace',
  'bdfm': 'nyct%2Fgtfs-bdfm',
  'g': 'nyct%2Fgtfs-g',
  'jz': 'nyct%2Fgtfs-jz',
  'nqrw': 'nyct%2Fgtfs-nqrw',
  'l': 'nyct%2Fgtfs-l',
  'si': 'nyct%2Fgtfs-si',
};

export const MTA_BASE_URL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/';
export const MTA_ALERTS_ENDPOINT = 'camsys%2Fsubway-alerts.json';

export const ROUTES: Record<string, RouteMeta> = {
  // Red - Seventh Avenue Line
  '1': { id: '1', name: '1', longName: 'Broadway-7th Ave Local', color: '#EE352E', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '2': { id: '2', name: '2', longName: '7th Ave Express', color: '#EE352E', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '3': { id: '3', name: '3', longName: '7th Ave Express', color: '#EE352E', textColor: '#FFFFFF', feedUrlKey: '1234567' },

  // Green - Lexington Avenue Line
  '4': { id: '4', name: '4', longName: 'Lexington Ave Express', color: '#00933C', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '5': { id: '5', name: '5', longName: 'Lexington Ave Express', color: '#00933C', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '6': { id: '6', name: '6', longName: 'Lexington Ave Local', color: '#00933C', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '6X': { id: '6X', name: '6', longName: 'Lexington Ave Express', color: '#00933C', textColor: '#FFFFFF', feedUrlKey: '1234567', isDiamond: true },

  // Purple - Flushing Line
  '7': { id: '7', name: '7', longName: 'Flushing Local', color: '#B933AD', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  '7X': { id: '7X', name: '7', longName: 'Flushing Express', color: '#B933AD', textColor: '#FFFFFF', feedUrlKey: '1234567', isDiamond: true },

  // Blue - Eighth Avenue Line
  'A': { id: 'A', name: 'A', longName: '8th Ave Express', color: '#0039A6', textColor: '#FFFFFF', feedUrlKey: 'ace' },
  'C': { id: 'C', name: 'C', longName: '8th Ave Local', color: '#0039A6', textColor: '#FFFFFF', feedUrlKey: 'ace' },
  'E': { id: 'E', name: 'E', longName: '8th Ave Local', color: '#0039A6', textColor: '#FFFFFF', feedUrlKey: 'ace' },

  // Orange - Sixth Avenue Line
  'B': { id: 'B', name: 'B', longName: '6th Ave Express', color: '#FF6319', textColor: '#FFFFFF', feedUrlKey: 'bdfm' },
  'D': { id: 'D', name: 'D', longName: '6th Ave Express', color: '#FF6319', textColor: '#FFFFFF', feedUrlKey: 'bdfm' },
  'F': { id: 'F', name: 'F', longName: '6th Ave Local', color: '#FF6319', textColor: '#FFFFFF', feedUrlKey: 'bdfm' },
  'FX': { id: 'FX', name: 'F', longName: '6th Ave Express', color: '#FF6319', textColor: '#FFFFFF', feedUrlKey: 'bdfm', isDiamond: true },
  'M': { id: 'M', name: 'M', longName: 'Queens Blvd / 6th Ave Local', color: '#FF6319', textColor: '#FFFFFF', feedUrlKey: 'bdfm' },

  // Lime Green - Crosstown Line
  'G': { id: 'G', name: 'G', longName: 'Brooklyn-Queens Crosstown', color: '#6CBE45', textColor: '#FFFFFF', feedUrlKey: 'g' },

  // Brown - Nassau Street Line
  'J': { id: 'J', name: 'J', longName: 'Nassau St Express / Local', color: '#996633', textColor: '#FFFFFF', feedUrlKey: 'jz' },
  'Z': { id: 'Z', name: 'Z', longName: 'Nassau St Express', color: '#996633', textColor: '#FFFFFF', feedUrlKey: 'jz' },

  // Slate Gray - Canarsie Line
  'L': { id: 'L', name: 'L', longName: '14th St-Canarsie Local', color: '#A7A9AC', textColor: '#FFFFFF', feedUrlKey: 'l' },

  // Yellow - Broadway Line
  'N': { id: 'N', name: 'N', longName: 'Broadway Express', color: '#FCCC0A', textColor: '#000000', feedUrlKey: 'nqrw' },
  'Q': { id: 'Q', name: 'Q', longName: '2nd Ave / Broadway Express', color: '#FCCC0A', textColor: '#000000', feedUrlKey: 'nqrw' },
  'R': { id: 'R', name: 'R', longName: 'Broadway Local', color: '#FCCC0A', textColor: '#000000', feedUrlKey: 'nqrw' },
  'W': { id: 'W', name: 'W', longName: 'Broadway Local', color: '#FCCC0A', textColor: '#000000', feedUrlKey: 'nqrw' },

  // Dark Gray - Shuttles
  'S': { id: 'S', name: 'S', longName: 'Subway Shuttle', color: '#808183', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  'GS': { id: 'GS', name: 'S', longName: '42nd St Shuttle', color: '#808183', textColor: '#FFFFFF', feedUrlKey: '1234567' },
  'FS': { id: 'FS', name: 'S', longName: 'Franklin Ave Shuttle', color: '#808183', textColor: '#FFFFFF', feedUrlKey: 'ace' },
  'H': { id: 'H', name: 'S', longName: 'Rockaway Park Shuttle', color: '#808183', textColor: '#FFFFFF', feedUrlKey: 'ace' },

  // Staten Island Railway
  'SI': { id: 'SI', name: 'SIR', longName: 'Staten Island Railway', color: '#0039A6', textColor: '#FFFFFF', feedUrlKey: 'si' },
  'SIR': { id: 'SIR', name: 'SIR', longName: 'Staten Island Railway', color: '#0039A6', textColor: '#FFFFFF', feedUrlKey: 'si' },
};

export const ALL_SUBWAY_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'C', 'E', 'B', 'D', 'F', 'M',
  'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', 'S', 'SIR'
];

export function getRouteMeta(routeId: string): RouteMeta {
  const cleanId = routeId.toUpperCase().trim();
  if (ROUTES[cleanId]) {
    return ROUTES[cleanId];
  }
  // Check for express diamond variants like 6X, 7X
  if (cleanId === '6X' || cleanId === '7X' || cleanId === 'FX') {
    return ROUTES[cleanId];
  }
  // Default fallback
  return {
    id: cleanId,
    name: cleanId,
    longName: `${cleanId} Line`,
    color: '#808183',
    textColor: '#FFFFFF',
    feedUrlKey: '1234567',
  };
}

export function getFeedsForRoutes(routes: string[]): FeedKey[] {
  const feedSet = new Set<FeedKey>();
  for (const r of routes) {
    const meta = getRouteMeta(r);
    feedSet.add(meta.feedUrlKey);
  }
  return Array.from(feedSet);
}
