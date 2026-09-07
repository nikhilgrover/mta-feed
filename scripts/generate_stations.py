import urllib.request
import csv
import io
import json
import sys
import os

# Import existing station_dict if available
sys.path.append('/Users/nikhil/workspace/arrivals-board')
try:
    from station_dict import mta_stations
except ImportError:
    mta_stations = {}

csv_url = 'https://data.ny.gov/api/views/39hk-dx4f/rows.csv?accessType=DOWNLOAD'
req = urllib.request.Request(csv_url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
except Exception as e:
    print(f"Error fetching CSV: {e}")
    content = ""

stations = []
borough_map = {
    'M': 'Manhattan',
    'Bk': 'Brooklyn',
    'Q': 'Queens',
    'Bx': 'Bronx',
    'SI': 'Staten Island'
}

stop_names = dict(mta_stations)

if content:
    reader = csv.DictReader(io.StringIO(content))
    for r in reader:
        stop_id = r.get('GTFS Stop ID', '').strip()
        name = r.get('Stop Name', '').strip()
        b_code = r.get('Borough', '').strip()
        borough = borough_map.get(b_code, b_code)
        routes_str = r.get('Daytime Routes', '').strip()
        routes = [x.strip() for x in routes_str.split() if x.strip()]
        north_label = r.get('North Direction Label', '').strip() or 'Uptown / Northbound'
        south_label = r.get('South Direction Label', '').strip() or 'Downtown / Southbound'
        complex_id = r.get('Complex ID', '').strip() or stop_id
        ada = r.get('ADA', '').strip() == '1'
        try:
            lat = float(r.get('GTFS Latitude', '0') or 0)
            lon = float(r.get('GTFS Longitude', '0') or 0)
        except ValueError:
            lat, lon = 0.0, 0.0

        if stop_id:
            stations.append({
                'id': stop_id,
                'name': name,
                'borough': borough,
                'routes': routes,
                'northLabel': north_label,
                'southLabel': south_label,
                'complexId': complex_id,
                'ada': ada,
                'lat': lat,
                'lon': lon
            })
            stop_names[stop_id] = name
            stop_names[stop_id + 'N'] = name
            stop_names[stop_id + 'S'] = name

# Sort stations by name
stations.sort(key=lambda s: s['name'])

# Generate src/data/stations.ts
ts_content = f"""// Auto-generated official NYC MTA Subway Stations dataset
export interface Station {{
  id: string;
  name: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';
  routes: string[];
  northLabel: string;
  southLabel: string;
  complexId: string;
  ada: boolean;
  lat: number;
  lon: number;
}}

export const STATIONS: Station[] = {json.dumps(stations, indent=2)};

export const POPULAR_STATION_IDS = [
  '127', // Times Sq-42 St (1,2,3)
  'R16', // Times Sq-42 St (N,Q,R,W)
  '631', // Grand Central-42 St (4,5,6)
  '723', // Grand Central-42 St (7)
  '128', // 34 St-Penn Station (1,2,3)
  'A28', // 34 St-Penn Station (A,C,E)
  '635', // 14 St-Union Sq (4,5,6)
  'L03', // 14 St-Union Sq (L)
  'R20', // 14 St-Union Sq (N,Q,R,W)
  'A32', // W 4 St-Wash Sq (A,C,E)
  'D20', // W 4 St-Wash Sq (B,D,F,M)
  'L08', // Bedford Av (L)
  'A41', // Jay St-MetroTech (A,C,F)
  '235', // Atlantic Av-Barclays Ctr (2,3,4,5)
  'R31', // Atlantic Av-Barclays Ctr (B,D,N,Q,R)
  '414', // 161 St-Yankee Stadium (4)
  'D11', // 161 St-Yankee Stadium (B,D)
  '701', // Flushing-Main St (7)
  'D43', // Coney Island-Stillwell Av (D,F,N,Q)
  'A38', // Fulton St (A,C)
  '229', // Fulton St (2,3)
  '640', // Brooklyn Bridge-City Hall (4,5,6)
];
"""

with open('src/data/stations.ts', 'w') as f:
    f.write(ts_content)

# Generate src/data/stopNames.ts
stop_ts_content = f"""// Comprehensive map of all MTA Stop IDs (including N/S platform suffixes) to Clean Station Names
export const STOP_NAME_MAP: Record<string, string> = {json.dumps(stop_names, indent=2)};
"""

with open('src/data/stopNames.ts', 'w') as f:
    f.write(stop_ts_content)

print(f"Successfully wrote {len(stations)} stations to src/data/stations.ts and {len(stop_names)} stop names to src/data/stopNames.ts")
