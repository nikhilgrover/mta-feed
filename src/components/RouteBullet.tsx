import React from 'react';
import { getRouteMeta } from '../constants/routes';

interface RouteBulletProps {
  routeId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  ledMode?: boolean;
  className?: string;
}

export const RouteBullet: React.FC<RouteBulletProps> = ({
  routeId,
  size = 'md',
  ledMode = false,
  className = '',
}) => {
  const meta = getRouteMeta(routeId);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-6 h-6 text-xs font-bold',
    md: 'w-8 h-8 text-sm font-black',
    lg: 'w-10 h-10 text-base font-black',
    xl: 'w-12 h-12 text-lg font-black',
    '2xl': 'w-16 h-16 text-2xl font-black',
  };

  const isDiamond = meta.isDiamond || routeId.toUpperCase().endsWith('X');
  const displayText = meta.name;

  if (ledMode) {
    // LED Matrix style route indicator
    return (
      <span
        className={`inline-flex items-center justify-center font-mono border-2 border-amber-400/80 text-amber-300 font-black tracking-tighter ${
          isDiamond ? 'rotate-45 p-1' : 'rounded-full'
        } ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: '0 0 10px rgba(251, 191, 36, 0.4), inset 0 0 5px rgba(251, 191, 36, 0.2)',
          textShadow: '0 0 8px rgba(251, 191, 36, 0.9)',
        }}
      >
        <span className={isDiamond ? '-rotate-45 inline-block' : ''}>
          {displayText}
        </span>
      </span>
    );
  }

  if (isDiamond) {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 rotate-45 transition-transform ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: meta.color, color: meta.textColor }}
        title={`${meta.longName} (Express)`}
      >
        <span className="-rotate-45 inline-block select-none font-sans font-black">
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-sans select-none shadow-sm transition-transform ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: meta.color, color: meta.textColor }}
      title={meta.longName}
    >
      <span className="leading-none pt-[1px]">{displayText}</span>
    </div>
  );
};
