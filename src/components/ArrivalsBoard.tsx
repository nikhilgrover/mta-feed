import React, { useState } from 'react';
import { SubwayArrival } from '../services/mtaApi';
import { RouteBullet } from './RouteBullet';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Radio, 
  ChevronsRight,
  Split,
  ListFilter
} from 'lucide-react';

interface ArrivalsBoardProps {
  northbound: SubwayArrival[];
  southbound: SubwayArrival[];
  northLabel: string;
  southLabel: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: number;
  secondsUntilNextRefresh: number;
}

export const ArrivalsBoard: React.FC<ArrivalsBoardProps> = ({
  northbound,
  southbound,
  northLabel,
  southLabel,
  onRefresh,
  isRefreshing,
  lastUpdated,
  secondsUntilNextRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'SPLIT' | 'ALL'>('SPLIT');

  const formatClockTime = (epochSeconds: number) => {
    return new Date(epochSeconds * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const renderArrivalRow = (arrival: SubwayArrival) => {
    const isArriving = arrival.isArriving;

    return (
      <div
        key={arrival.id}
        className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/70 transition-all"
      >
        {/* Route Bullet & Destination */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <RouteBullet routeId={arrival.routeId} size="md" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-zinc-100 truncate">
                {arrival.destination}
              </span>
              {arrival.isDelayed && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  +{Math.round(arrival.delaySeconds / 60)}m delay
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
              <span className="text-zinc-400">Scheduled: {formatClockTime(arrival.arrivalTime)}</span>
            </div>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className="flex flex-col items-end shrink-0 pl-3">
          {isArriving ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-ping" />
              <span className="font-mono text-sm font-black tracking-wider">ARRIVING NOW</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 font-mono">
              <span className="text-base sm:text-lg font-black text-amber-400">
                {arrival.minutesAway}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                MIN
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
      {/* Action & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Platform Arrivals Schedule</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Auto-refreshing in {secondsUntilNextRefresh}s • Last updated:{' '}
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Just now'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-all ${
                viewMode === 'SPLIT'
                  ? 'bg-zinc-800 text-amber-400 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Split Platforms</span>
            </button>
            <button
              onClick={() => setViewMode('ALL')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-all ${
                viewMode === 'ALL'
                  ? 'bg-zinc-800 text-amber-400 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3 h-3" />
              <span>All Trains</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 disabled:opacity-50 transition-all"
            title="Refresh GTFS-Realtime data from MTA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {viewMode === 'SPLIT' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Northbound Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <ArrowUpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  UPTOWN / NORTHBOUND
                </span>
                <span className="text-xs text-zinc-400 truncate block">
                  {northLabel}
                </span>
              </div>
              <span className="ml-auto text-xs font-mono text-zinc-500">
                {northbound.length} trains
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {northbound.length === 0 ? (
                <div className="p-6 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-center text-zinc-500 text-xs font-mono">
                  No Northbound trains scheduled in next 2 hours
                </div>
              ) : (
                northbound.slice(0, 8).map(renderArrivalRow)
              )}
            </div>
          </div>

          {/* Southbound Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <ArrowDownCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">
                  DOWNTOWN / SOUTHBOUND
                </span>
                <span className="text-xs text-zinc-400 truncate block">
                  {southLabel}
                </span>
              </div>
              <span className="ml-auto text-xs font-mono text-zinc-500">
                {southbound.length} trains
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {southbound.length === 0 ? (
                <div className="p-6 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-center text-zinc-500 text-xs font-mono">
                  No Southbound trains scheduled in next 2 hours
                </div>
              ) : (
                southbound.slice(0, 8).map(renderArrivalRow)
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Merged All Trains View */
        <div className="flex flex-col gap-2">
          {northbound.concat(southbound).length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
              No upcoming trains currently in MTA feeds for this station.
            </div>
          ) : (
            northbound
              .concat(southbound)
              .sort((a, b) => a.secondsAway - b.secondsAway)
              .slice(0, 16)
              .map(renderArrivalRow)
          )}
        </div>
      )}
    </div>
  );
};
