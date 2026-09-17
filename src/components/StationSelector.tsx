import React, { useState, useMemo, useEffect } from 'react';
import { Station, STATIONS, POPULAR_STATION_IDS } from '../data/stations';
import { RouteBullet } from './RouteBullet';
import { ALL_SUBWAY_LINES } from '../constants/routes';
import { 
  Search, 
  Star, 
  Accessibility, 
  MapPin, 
  Train, 
  X, 
  Check, 
  ChevronDown, 
  SlidersHorizontal 
} from 'lucide-react';

interface StationSelectorProps {
  selectedStation: Station;
  onSelectStation: (station: Station) => void;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  selectedStation,
  onSelectStation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorough, setSelectedBorough] = useState<string>('ALL');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('subway_favorites');
      if (saved) {
        let parsed: string[] = JSON.parse(saved);
        const needed = ['235', 'D24', 'R31'];
        const missing = needed.filter(id => !parsed.includes(id));
        if (missing.length > 0) {
          parsed = [...missing, ...parsed];
          localStorage.setItem('subway_favorites', JSON.stringify(parsed));
        }
        return parsed;
      }
      const initial = ['235', 'D24', 'R31', '127', 'L08', '631', '635'];
      localStorage.setItem('subway_favorites', JSON.stringify(initial));
      return initial;
    } catch {
      return ['235', 'D24', 'R31', '127', 'L08', '631', '635'];
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Save favorites to localStorage
  const toggleFavorite = (stationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      try {
        localStorage.setItem('subway_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const boroughs = ['ALL', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  // Filtered station list
  const filteredStations = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return STATIONS.filter((station) => {
      // Borough filter
      if (selectedBorough !== 'ALL' && station.borough !== selectedBorough) {
        return false;
      }

      // Line filter
      if (selectedLineFilter && !station.routes.includes(selectedLineFilter)) {
        return false;
      }

      // Search term (name, stopId, routes)
      if (term) {
        const matchesName = station.name.toLowerCase().includes(term);
        const matchesId = station.id.toLowerCase().includes(term);
        const matchesRoute = station.routes.some((r) => r.toLowerCase() === term);
        const matchesBorough = station.borough.toLowerCase().includes(term);
        return matchesName || matchesId || matchesRoute || matchesBorough;
      }

      return true;
    });
  }, [searchTerm, selectedBorough, selectedLineFilter]);

  // Popular stations list for quick buttons
  const popularStations = useMemo(() => {
    return STATIONS.filter((s) => POPULAR_STATION_IDS.includes(s.id));
  }, []);

  // Favorite stations
  const favoriteStations = useMemo(() => {
    return STATIONS.filter((s) => favorites.includes(s.id));
  }, [favorites]);

  return (
    <div className="w-full max-w-4xl bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Train className="w-6 h-6 text-amber-400" />
            <span>NYC Subway Arrivals</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time countdown powered by MTA General Transit Feed Specification (GTFS)
          </p>
        </div>

        {/* Selected Station Badge */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-700/80">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 block uppercase font-mono leading-none">CURRENT STATION</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-100">{selectedStation.name}</span>
          </div>
          <div className="flex items-center gap-1 pl-2 ml-1 border-l border-zinc-800">
            {selectedStation.routes.slice(0, 4).map((r) => (
              <RouteBullet key={r} routeId={r} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Select Favorites & Popular Hubs */}
      <div className="mb-4">
        <div className="text-xs text-zinc-400 font-mono mb-2 flex items-center justify-between">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Quick Access Stations
          </span>
          <span className="text-[11px] text-zinc-500">
            {STATIONS.length} stations across 5 boroughs
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {favoriteStations.map((station) => {
            const isSelected = station.id === selectedStation.id;
            return (
              <button
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-zinc-950 shadow-md font-bold'
                    : 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/50'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{station.name}</span>
                <div className="flex -space-x-1 ml-0.5">
                  {station.routes.slice(0, 3).map((r) => (
                    <RouteBullet key={r} routeId={r} size="xs" />
                  ))}
                </div>
              </button>
            );
          })}

          {/* Fallback popular hubs if favorites is small */}
          {favoriteStations.length < 3 &&
            popularStations.slice(0, 5).map((station) => {
              if (favorites.includes(station.id)) return null;
              const isSelected = station.id === selectedStation.id;
              return (
                <button
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/30'
                  }`}
                >
                  <span>{station.name}</span>
                  <div className="flex -space-x-1 ml-0.5">
                    {station.routes.slice(0, 3).map((r) => (
                      <RouteBullet key={r} routeId={r} size="xs" />
                    ))}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Search Input & Filter Toggle */}
      <div className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search by station name, line (e.g. 'L', 'Times Sq', 'Bedford', 'Canal')..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            showFilters || selectedBorough !== 'ALL' || selectedLineFilter !== null
              ? 'bg-amber-400/10 border-amber-400/60 text-amber-400'
              : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(selectedBorough !== 'ALL' || selectedLineFilter) && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>
      </div>

      {/* Expandable Filters Tray */}
      {showFilters && (
        <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-3">
          {/* Borough Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">Borough:</span>
            {boroughs.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBorough(b)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedBorough === b
                    ? 'bg-amber-400 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Subway Line Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">Line:</span>
            <button
              onClick={() => setSelectedLineFilter(null)}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                selectedLineFilter === null
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            {ALL_SUBWAY_LINES.map((line) => (
              <button
                key={line}
                onClick={() => setSelectedLineFilter(selectedLineFilter === line ? null : line)}
                className={`transition-transform hover:scale-110 ${
                  selectedLineFilter === line ? 'ring-2 ring-amber-400 rounded-full scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <RouteBullet routeId={line} size="xs" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Station Search Results Dropdown / Picker */}
      {(isDropdownOpen || searchTerm) && (
        <div className="mt-3 border border-zinc-700 bg-zinc-950 rounded-xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-zinc-800/60 z-30">
          <div className="p-2 bg-zinc-900/90 sticky top-0 z-10 flex items-center justify-between text-xs text-zinc-400 px-3">
            <span>Showing {filteredStations.length} stations</span>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-zinc-400 hover:text-white font-mono text-[11px]"
            >
              CLOSE ✕
            </button>
          </div>

          {filteredStations.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-sm">
              No stations found matching &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            filteredStations.slice(0, 50).map((station) => {
              const isSelected = station.id === selectedStation.id;
              const isFav = favorites.includes(station.id);

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    onSelectStation(station);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10 hover:bg-amber-400/15'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={(e) => toggleFavorite(station.id, e)}
                      className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-amber-300' : 'text-zinc-100'
                          }`}
                        >
                          {station.name}
                        </span>
                        {station.ada && (
                          <span title="ADA Accessible Station" className="inline-flex"><Accessibility className="w-3.5 h-3.5 text-sky-400 shrink-0" /></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500">[{station.borough}]</span>
                        <span>•</span>
                        <span className="truncate text-zinc-400">
                          {station.northLabel} / {station.southLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    <div className="flex items-center gap-1">
                      {station.routes.map((r) => (
                        <RouteBullet key={r} routeId={r} size="sm" />
                      ))}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 ml-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
