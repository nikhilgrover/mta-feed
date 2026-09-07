import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  Cpu, 
  Zap, 
  Database, 
  ArrowRightLeft, 
  ShieldCheck, 
  X, 
  BookOpen, 
  Binary,
  CheckCircle2,
  Server
} from 'lucide-react';

interface SystemDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDesignModal: React.FC<SystemDesignModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ARCH' | 'GTFS' | 'SCALE' | 'EDGE'>('ARCH');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>NYC Subway Real-Time System Design Blueprint</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  STAFF LEVEL SDI
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                GTFS-Realtime Protobuf Ingestion, Push vs Pull Trade-offs, and Transit Telemetry Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-zinc-950/60 border-b border-zinc-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('ARCH')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ARCH'
                ? 'bg-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>1. High-Level Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('GTFS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'GTFS'
                ? 'bg-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>2. GTFS Protobuf vs JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('SCALE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SCALE'
                ? 'bg-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>3. Push vs Pull & Polling</span>
          </button>

          <button
            onClick={() => setActiveTab('EDGE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'EDGE'
                ? 'bg-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Edge Caching & Resiliency</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm leading-relaxed">
          {activeTab === 'ARCH' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Transit Data Pipeline (Static Schedule + Real-Time Streaming)</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Transit systems separate immutable relational baseline schedules from ephemeral, fast-changing vehicle progress deltas:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">GTFS Static (Schedule)</span>
                    <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                      <li>472 NYC stations & complexes</li>
                      <li>Route shapes, calendars, stop sequences</li>
                      <li>Published weekly/monthly as zip files</li>
                      <li>Pre-processed into local Station Dictionary</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-emerald-400 font-bold block mb-1">GTFS-Realtime (Live Feeds)</span>
                    <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                      <li>TripUpdates: Live delays & countdowns</li>
                      <li>VehiclePositions: GPS/transponder coordinates</li>
                      <li>Alerts: Service suspensions, planned work</li>
                      <li>Updated every 30 seconds via AWS CloudFront</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <h4 className="text-white font-semibold text-sm">Station Stop ID Resolution Engine</h4>
                <p className="text-xs text-zinc-400">
                  Subway stop IDs in the MTA data follow parent-child hierarchy. For example, parent station <code className="text-amber-300">L08</code> (Bedford Av) has child directional tracks <code className="text-amber-300">L08N</code> (Northbound/8 Av) and <code className="text-amber-300">L08S</code> (Southbound/Canarsie). When a train trips track transponders, the MTA broadcast updates the remaining stop sequence for that <code className="text-amber-300">tripId</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'GTFS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  <Binary className="w-4 h-4 text-amber-400" />
                  <span>Protocol Buffers (protobuf) vs JSON Serialization</span>
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Why does the MTA and global transit authority standardize on binary Protocol Buffers over JSON?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">RAW JSON EQUIVALENT</span>
                    <span className="text-rose-400 text-lg font-bold">~140 KB</span>
                    <span className="text-zinc-500 block text-[10px]">Heavy string keys & quotes</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">PROTOBUF BINARY</span>
                    <span className="text-emerald-400 text-lg font-bold">12 - 18 KB</span>
                    <span className="text-zinc-500 block text-[10px]">88% size reduction</span>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">DESERIALIZATION SPEED</span>
                    <span className="text-amber-400 text-lg font-bold">3.2x Faster</span>
                    <span className="text-zinc-500 block text-[10px]">Direct typed byte decoding</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-2">
                <h4 className="text-white font-semibold text-sm">Schema Enforcement</h4>
                <p className="text-zinc-400">
                  Using <code className="text-amber-300">gtfs-realtime-bindings</code>, feed parsing guarantees backward and forward compatibility using proto3 field tags (e.g. tag 1 for <code className="text-amber-300">trip</code>, tag 2 for <code className="text-amber-300">stop_time_update</code>). Unknown fields are ignored safely without runtime schema breaks.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'SCALE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span>Transit Push vs. Pull: Trade-off Analysis</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                        <th className="py-2 pr-4">Dimension</th>
                        <th className="py-2 pr-4 text-amber-400">Short Polling (30s)</th>
                        <th className="py-2 pr-4 text-emerald-400">WebSockets</th>
                        <th className="py-2 text-sky-400">Server-Sent Events (SSE)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2 pr-4 text-zinc-300 font-sans font-semibold">CDN Cacheability</td>
                        <td className="py-2 pr-4 text-emerald-400">100% Edge Cached (CloudFront)</td>
                        <td className="py-2 pr-4 text-rose-400">None (Bypasses Edge)</td>
                        <td className="py-2 text-rose-400">Difficult / Ephemeral</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-zinc-300 font-sans font-semibold">MTA Scale (5M riders)</td>
                        <td className="py-2 pr-4 text-emerald-400">Trivial: 1 origin fetch per 30s</td>
                        <td className="py-2 pr-4 text-rose-400">Massive server memory pressure</td>
                        <td className="py-2 text-amber-400">Connection limits per proxy</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-zinc-300 font-sans font-semibold">Data Freshness</td>
                        <td className="py-2 pr-4 text-zinc-400">Bound to feed update (30s)</td>
                        <td className="py-2 pr-4 text-zinc-400">Sub-second on push</td>
                        <td className="py-2 text-zinc-400">Sub-second on push</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-zinc-300 font-sans font-semibold">Architectural Fit</td>
                        <td className="py-2 pr-4 text-emerald-400">Optimal for transit (static source)</td>
                        <td className="py-2 pr-4 text-zinc-400">Overkill when source is 30s polled</td>
                        <td className="py-2 text-zinc-400">Viable with regional broker</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                <p className="text-zinc-400">
                  <strong className="text-white">SDI Key Takeaway:</strong> Because physical subway signals and wayside equipment only refresh train positions into the central dispatcher every 15–30 seconds, maintaining persistent duplex WebSocket connections to 2 million mobile clients provides zero freshness improvement over HTTP/2 requests coalesced at CloudFront edge caches.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'EDGE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Resiliency, Edge Caching & Clock Skew Handling</span>
                </h3>

                <ul className="space-y-2.5 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Local In-Memory Debouncing:</strong> Our client service enforces an in-memory 12-second TTL. Rapid component remounts or tab shifts never initiate redundant network round-trips.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Clock Skew Tolerance:</strong> Client device system clocks frequently deviate by ±30 seconds. The countdown computation clamps negative seconds to zero and displays blinking &ldquo;ARR&rdquo; for arrivals within 60 seconds of departure.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Route Group Feed Sharding:</strong> Rather than querying one monolithic 15MB system-wide GTFS feed, MTA shards routes into 8 independent lines (ACE, BDFM, L, etc.). Our client fetches only the exact feeds required for the active station.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-500">
          <span>Google Antigravity Engineering</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
