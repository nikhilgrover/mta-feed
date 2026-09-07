import React, { useState } from 'react';
import { SubwayAlert } from '../services/mtaApi';
import { RouteBullet } from './RouteBullet';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, ExternalLink } from 'lucide-react';

interface AlertsDrawerProps {
  alerts: SubwayAlert[];
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ alerts }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (alerts.length === 0) {
    return (
      <div className="w-full max-w-4xl bg-zinc-900/60 border border-emerald-900/40 rounded-xl p-3 mb-6 flex items-center gap-2.5 text-xs text-emerald-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>GOOD SERVICE: No active service alerts or planned delays reported on lines serving this station.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-zinc-900/90 backdrop-blur border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                MTA Service Advisories ({alerts.length})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Service changes, construction, and delays affecting lines at this station
            </p>
          </div>
        </div>

        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {alert.routeIds.map((r) => (
                    <RouteBullet key={r} routeId={r} size="xs" />
                  ))}
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase ml-1">
                    {alert.alertType}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-zinc-100">
                {alert.headerText}
              </h4>

              {alert.descriptionText && (
                <p className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/60 font-sans">
                  {alert.descriptionText}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
