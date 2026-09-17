import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Station, STATIONS } from './data/stations';
import { 
  fetchArrivalsForStation, 
  StationArrivalsResult, 
  SubwayArrival, 
  SubwayAlert 
} from './services/mtaApi';
import { SubwaySign } from './components/SubwaySign';
import { StationSelector } from './components/StationSelector';
import { ArrivalsBoard } from './components/ArrivalsBoard';
import { AlertsDrawer } from './components/AlertsDrawer';
import { SystemDesignModal } from './components/SystemDesignModal';
import { 
  Train, 
  Layers, 
  Wifi, 
  Radio, 
  ExternalLink, 
   
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 30;

export const App: React.FC = () => {
  // Default station: Atlantic Av-Barclays Ctr (2, 3, 4, 5, B, D, N, Q, R)
  const [selectedStation, setSelectedStation] = useState<Station>(() => {
    try {
      const savedId = localStorage.getItem('last_selected_station_id');
      // If previously defaulted to 127 or null, switch to Atlantic Av-Barclays Ctr
      if (savedId && savedId !== '127') {
        const found = STATIONS.find((s) => s.id === savedId);
        if (found) return found;
      }
    } catch {}
    // Default to Atlantic Av-Barclays Ctr ('235')
    return STATIONS.find((s) => s.id === '235') || STATIONS[0];
  });

  const [arrivalsResult, setArrivalsResult] = useState<StationArrivalsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState<boolean>(false);

  const countdownTimerRef = useRef<any>(null);

  // Load arrivals for the active station
  const loadStationData = useCallback(async (station: Station, isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const result = await fetchArrivalsForStation(station);
      setArrivalsResult(result);
      setLastUpdated(result.fetchedAt);
      setSecondsUntilNextRefresh(REFRESH_INTERVAL_SECONDS);
    } catch (err: any) {
      console.error('Failed to load MTA arrivals:', err);
      setErrorMessage(
        err?.message || 'Unable to reach MTA GTFS-Realtime feeds. Retrying automatically...'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // When selected station changes, fetch immediately & persist to localStorage
  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    try {
      localStorage.setItem('last_selected_station_id', station.id);
    } catch {}
    loadStationData(station, false);
  };

  // Initial fetch on mount & station change
  useEffect(() => {
    loadStationData(selectedStation, false);
  }, [selectedStation, loadStationData]);

  // Periodic polling & live seconds countdown
  useEffect(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setSecondsUntilNextRefresh((prev) => {
        if (prev <= 1) {
          // Trigger background refresh
          loadStationData(selectedStation, true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [selectedStation, loadStationData]);

  const arrivals: SubwayArrival[] = arrivalsResult?.arrivals || [];
  const northbound: SubwayArrival[] = arrivalsResult?.northbound || [];
  const southbound: SubwayArrival[] = arrivalsResult?.southbound || [];
  const alerts: SubwayAlert[] = arrivalsResult?.alerts || [];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col items-center">
      {/* Top Application Bar */}
      <header className="w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 shadow-md">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-white font-sans flex items-center gap-1.5">
                MTA REALTIME TRACKER
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono -mt-0.5">
                GTFS & GTFS-Realtime Protocol Buffers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Feed Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300">FEED LIVE</span>
            </div>

            {/* System Architecture Blueprint Button */}
            <button
              onClick={() => setIsDesignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-sm"
              title="View Staff-level System Design Interview Blueprint"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>System Design</span>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/nikhilgrover/mta-feed"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="GitHub Repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-3 sm:px-6 py-6 flex flex-col items-center">
        {/* Error Notification if any */}
        {errorMessage && (
          <div className="w-full max-w-4xl mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Station Search, Favorites & Filters */}
        <StationSelector
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
        />

        {/* The Rotating NYC Subway Countdown Sign */}
        <SubwaySign
          stationName={selectedStation.name}
          arrivals={arrivals}
          alerts={alerts}
          northLabel={selectedStation.northLabel}
          southLabel={selectedStation.southLabel}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {/* Active MTA Service Advisories */}
        <AlertsDrawer alerts={alerts} />

        {/* Detailed Platform Schedule Dashboard */}
        <ArrivalsBoard
          northbound={northbound}
          southbound={southbound}
          northLabel={selectedStation.northLabel}
          southLabel={selectedStation.southLabel}
          onRefresh={() => loadStationData(selectedStation, true)}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          secondsUntilNextRefresh={secondsUntilNextRefresh}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-8 px-4 text-center text-xs text-zinc-400 font-mono flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-4 text-zinc-400">
          <a
            href="https://gtfs.org/documentation/overview/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>GTFS Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <a
            href="https://new.mta.info/developers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>MTA Open Data Feeds</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <button
            onClick={() => setIsDesignModalOpen(true)}
            className="hover:text-amber-400 transition-colors underline decoration-amber-400/50"
          >
            Architecture Blueprint & SDI Analysis
          </button>
        </div>
        <p className="text-zinc-400 text-[11px] mt-1">
          Designed with Google Antigravity • Built with React, TypeScript, Vite & Protocol Buffers
        </p>
      </footer>

      {/* System Design Interview Blueprint Modal */}
      <SystemDesignModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />
    </div>
  );
};
export default App;
