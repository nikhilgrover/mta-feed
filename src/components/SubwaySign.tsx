import React, { useState, useEffect, useRef } from 'react';
import { SubwayArrival, SubwayAlert } from '../services/mtaApi';
import { RouteBullet } from './RouteBullet';
import { soundEffects } from '../utils/audioChime';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft, 
  Pause, 
  Play, 
  Compass,
  Sparkles,
  Radio,
  Clock
} from 'lucide-react';

interface SubwaySignProps {
  stationName: string;
  arrivals: SubwayArrival[];
  alerts: SubwayAlert[];
  northLabel: string;
  southLabel: string;
  isLoading: boolean;
  lastUpdated: number;
}

export type DirectionFilter = 'ALL' | 'N' | 'S';
export type DisplayStyle = 'AMBER_LED' | 'COLOR_DIGITAL';

export const SubwaySign: React.FC<SubwaySignProps> = ({
  stationName,
  arrivals,
  alerts,
  northLabel,
  southLabel,
  isLoading,
  lastUpdated,
}) => {
  // Sign configuration states
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('AMBER_LED');
  const [currentTime, setCurrentTime] = useState<string>('');

  const signRef = useRef<HTMLDivElement>(null);
  const announcedTripsRef = useRef<Set<string>>(new Set());

  // Filter arrivals by selected direction
  const filteredArrivals = arrivals.filter((a) => {
    if (directionFilter === 'ALL') return true;
    return a.direction === directionFilter;
  });

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.max(1, Math.ceil(filteredArrivals.length / ITEMS_PER_PAGE));

  // Reset page when direction filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [directionFilter]);

  // Keep page index within bounds if arrivals change
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  // Clock update (NYC time)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic page rotation engine (every 6.5 seconds)
  useEffect(() => {
    if (!isRotating || totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 6500);

    return () => clearInterval(interval);
  }, [isRotating, totalPages]);

  // Audio chime when a train enters "ARR" (< 60s) state
  useEffect(() => {
    if (!isSoundOn) return;

    for (const arrival of filteredArrivals) {
      if (arrival.isArriving && !announcedTripsRef.current.has(arrival.id)) {
        announcedTripsRef.current.add(arrival.id);
        soundEffects.playSubwayChime();
        break;
      }
    }
  }, [filteredArrivals, isSoundOn]);

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundEffects.setSoundEnabled(next);
    if (next) {
      soundEffects.playSubwayChime();
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (signRef.current?.requestFullscreen) {
        await signRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Sliced items for the current page
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const pageArrivals = filteredArrivals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Marquee announcement text: alerts + station courtesies
  const alertTickerText = alerts.length > 0
    ? alerts.map((a) => `[${a.routeIds.join('/')} ALERT]: ${a.headerText}`).join('  ✦  ')
    : 'NO SERVICE DELAYS REPORTED ON TRACKED LINES';

  const marqueeContent = `${alertTickerText}  ✦  STAND CLEAR OF THE CLOSING DOORS  ✦  CHECK TRAIN HEADSIGN BEFORE BOARDING  ✦  MTA GTFS-REALTIME FEED CONNECTED`;

  return (
    <div
      ref={signRef}
      className={`relative w-full flex flex-col items-center select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black p-4 sm:p-8 justify-center'
          : 'my-6'
      }`}
    >
      {/* Authentic Ceiling Mounting Brackets */}
      <div className="w-11/12 max-w-4xl flex justify-between px-12 -mb-2 z-10">
        <div className="flex flex-col items-center">
          <div className="w-3 h-8 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-950 border-x border-zinc-900 shadow-md"></div>
          <div className="w-8 h-2 bg-zinc-900 rounded-sm border border-zinc-700"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-8 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-950 border-x border-zinc-900 shadow-md"></div>
          <div className="w-8 h-2 bg-zinc-900 rounded-sm border border-zinc-700"></div>
        </div>
      </div>

      {/* Main Metal Enclosure */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-2xl p-3 sm:p-5 border-4 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Enclosure Ventilation Slits */}
        <div className="absolute top-2 right-6 flex gap-1.5 opacity-60">
          <div className="w-6 h-1 bg-zinc-700 rounded-full"></div>
          <div className="w-6 h-1 bg-zinc-700 rounded-full"></div>
          <div className="w-6 h-1 bg-zinc-700 rounded-full"></div>
        </div>

        {/* Industrial Corner Screws */}
        <div className="absolute top-2.5 left-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-950 font-bold">
          +
        </div>
        <div className="absolute top-2.5 right-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-950 font-bold">
          +
        </div>
        <div className="absolute bottom-2.5 left-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-950 font-bold">
          +
        </div>
        <div className="absolute bottom-2.5 right-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-950 font-bold">
          +
        </div>

        {/* Top Header Bar / Physical Substation Placard */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-zinc-800 text-xs px-2">
          {/* Station Title & Line Info */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span className="font-mono font-bold tracking-wider text-emerald-400 text-[11px] uppercase">
                MTA REALTIME
              </span>
            </div>
            <span className="text-zinc-600">|</span>
            <h2 className="text-zinc-200 font-extrabold uppercase tracking-wide text-sm sm:text-base font-sans drop-shadow">
              {stationName}
            </h2>
          </div>

          {/* Time & Live Status */}
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-bold tracking-wider">{currentTime || '--:--:-- --'}</span>
            </div>
          </div>
        </div>

        {/* The LED Matrix Display Screen Bezel */}
        <div
          className={`relative rounded-xl border-4 border-zinc-900 overflow-hidden shadow-inner ${
            displayStyle === 'AMBER_LED'
              ? 'bg-[#09090b] text-amber-400'
              : 'bg-zinc-950 text-zinc-100'
          }`}
          style={{ minHeight: '260px' }}
        >
          {/* Authentic Dot Matrix Raster Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage:
                displayStyle === 'AMBER_LED'
                  ? 'radial-gradient(circle, rgba(251, 191, 36, 0.13) 1.2px, transparent 1.2px)'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
              backgroundSize: '5px 5px',
            }}
          />

          {/* Subtle CRT Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* Screen Content */}
          <div className="relative z-0 p-4 sm:p-6 flex flex-col justify-between min-h-[260px]">
            {/* Display Header / Direction Badge */}
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-2 mb-3 text-xs tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
                <span className="text-amber-400/90 font-bold uppercase">
                  {directionFilter === 'ALL'
                    ? 'ALL TRACKS / BOTH DIRECTIONS'
                    : directionFilter === 'N'
                    ? `NORTHBOUND: ${northLabel}`
                    : `SOUTHBOUND: ${southLabel}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-400/80 font-bold">
                <span>PAGE {currentPage + 1} / {totalPages}</span>
                {isRotating && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </div>
            </div>

            {/* Train Arrival Rows */}
            <div className="flex-1 flex flex-col justify-around gap-2.5">
              {isLoading && arrivals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 font-mono text-amber-300">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></span>
                  </div>
                  <span className="tracking-widest text-sm uppercase">CONNECTING TO MTA GTFS FEED...</span>
                </div>
              ) : pageArrivals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center font-mono text-amber-400/80">
                  <p className="text-base font-bold tracking-wider">NO UPCOMING TRAINS SCHEDULED</p>
                  <p className="text-xs text-amber-400/60 mt-1 uppercase">
                    TRY TOGGLING DIRECTIONS OR CHECK SERVICE ALERTS BELOW
                  </p>
                </div>
              ) : (
                pageArrivals.map((arrival, index) => {
                  const isLed = displayStyle === 'AMBER_LED';
                  const isArrivalFlash = arrival.isArriving;

                  return (
                    <div
                      key={arrival.id || index}
                      className="group flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-amber-400/5 transition-colors"
                      style={{
                        animation: 'fadeIn 0.35s ease-in-out',
                      }}
                    >
                      {/* Left: Bullet + Destination */}
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                        <RouteBullet
                          routeId={arrival.routeId}
                          size="lg"
                          ledMode={isLed}
                          className="shrink-0"
                        />

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`truncate font-bold tracking-wider uppercase ${
                                isLed
                                  ? 'font-mono text-base sm:text-xl text-amber-300'
                                  : 'font-sans text-base sm:text-xl text-white'
                              }`}
                              style={
                                isLed
                                  ? { textShadow: '0 0 10px rgba(251, 191, 36, 0.7)' }
                                  : {}
                              }
                            >
                              {arrival.destination}
                            </span>
                            {arrival.isDelayed && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-rose-950/80 text-rose-400 border border-rose-600/50 uppercase">
                                DELAYED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono tracking-widest text-amber-400/60 uppercase">
                            {arrival.direction === 'N' ? '▲ UPTOWN' : '▼ DOWNTOWN'} • {arrival.directionLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right: Countdown Minutes / ARR */}
                      <div className="text-right shrink-0 pl-3">
                        {isArrivalFlash ? (
                          <div className="flex flex-col items-end">
                            <span
                              className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-tighter animate-pulse"
                              style={{
                                textShadow:
                                  '0 0 12px rgba(251, 191, 36, 1), 0 0 24px rgba(245, 158, 11, 0.8)',
                              }}
                            >
                              ARR
                            </span>
                            <span className="text-[9px] font-mono text-amber-400/70 tracking-widest">
                              STAND BACK
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1 font-mono">
                            <span
                              className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight"
                              style={
                                isLed
                                  ? { textShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }
                                  : {}
                              }
                            >
                              {arrival.minutesAway}
                            </span>
                            <span className="text-xs font-bold text-amber-400/80 uppercase">
                              MIN
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom LED Scrolling Marquee Ticker */}
            <div className="mt-4 pt-2 border-t border-amber-400/20 flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                MTA NOTICE
              </span>
              <div className="relative overflow-hidden whitespace-nowrap flex-1 h-5">
                <div className="inline-block animate-marquee font-mono text-xs text-amber-300/90 tracking-wider">
                  {marqueeContent}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Industrial Control Bar on Sign Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-zinc-400 text-xs px-2">
          {/* Direction Segmented Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setDirectionFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase transition-all ${
                directionFilter === 'ALL'
                  ? 'bg-amber-400 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setDirectionFilter('N')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase transition-all ${
                directionFilter === 'N'
                  ? 'bg-amber-400 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={northLabel}
            >
              UPTOWN / NORTH
            </button>
            <button
              onClick={() => setDirectionFilter('S')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase transition-all ${
                directionFilter === 'S'
                  ? 'bg-amber-400 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={southLabel}
            >
              DOWNTOWN / SOUTH
            </button>
          </div>

          {/* Interactive Navigation & Toggles */}
          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))}
              disabled={totalPages <= 1}
              className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Arrivals"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pause / Play Rotation */}
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
              title={isRotating ? 'Pause sign rotation' : 'Resume sign rotation'}
            >
              {isRotating ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
              disabled={totalPages <= 1}
              className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Arrivals"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-zinc-800 mx-1"></span>

            {/* LED Matrix vs Full Color Style Toggle */}
            <button
              onClick={() =>
                setDisplayStyle(displayStyle === 'AMBER_LED' ? 'COLOR_DIGITAL' : 'AMBER_LED')
              }
              className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              title="Toggle Display Matrix Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{displayStyle === 'AMBER_LED' ? 'AMBER LED' : 'OLED'}</span>
            </button>

            {/* Audio Chime Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-md border transition-colors ${
                isSoundOn
                  ? 'bg-amber-400/10 border-amber-400/50 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title={isSoundOn ? 'Subway Arrival Chime: ON' : 'Subway Arrival Chime: MUTED'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen / Ambient Kiosk Mode */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Subway Kiosk Mode (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
