"use client"

import { Handle, Position, NodeProps } from 'reactflow';
import { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { getIconForLabel } from '@/lib/icon-utils'; 

interface IconProps {
  name: string;
  color: string;
  size?: string;
}

const fallbackIcon = 'server';

const DynamicIcon = ({ name, color, size = 'w-6 h-6' }: IconProps) => {
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().trim();

  const isValidIcon = kebabName in dynamicIconImports;
  
  const iconToLoad = isValidIcon ? kebabName : fallbackIcon;
  const iconImport = dynamicIconImports[iconToLoad as keyof typeof dynamicIconImports];

  const IconComponent = useMemo(() => {
    return lazy(iconImport);
  }, [iconImport]);

  return (
    <Suspense fallback={<div className={`${size} bg-white/10 animate-pulse rounded-lg`} />}>
      <IconComponent className={size} style={{ color }} />
    </Suspense>
  );
};

function getNodeCategory(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('database') || l.includes('db') || l.includes('store')) return 'Database';
  if (l.includes('cache') || l.includes('redis')) return 'Cache Layer';
  if (l.includes('api') || l.includes('gateway')) return 'API Endpoint';
  if (l.includes('service') || l.includes('processor')) return 'Service';
  if (l.includes('queue') || l.includes('event')) return 'Message Queue';
  if (l.includes('client') || l.includes('app') || l.includes('web')) return 'Client';
  if (l.includes('auth') || l.includes('login')) return 'Auth Service';
  if (l.includes('worker') || l.includes('background')) return 'Worker';
  if (l.includes('notification') || l.includes('dispatch')) return 'Dispatcher';
  if (l.includes('load') || l.includes('balancer')) return 'Load Balancer';
  if (l.includes('index') || l.includes('search')) return 'Search Engine';
  return 'Component';
}

export function SystemNode({ data }: NodeProps) {
  const isLocked = !!data.lockedBy
  
  const resolved = data.icon ? 
    { icon: data.icon, color: data.color || '#64748b' } : 
    getIconForLabel(data.label);

  const isOffline = data.flag === 'offline';
  const category = getNodeCategory(data.label);

  return (
    <div 
      className={`relative group min-w-[480px] transition-all duration-300 
        ${isOffline ? "opacity-40" : ""}
        ${isLocked ? 'ring-2 ring-indigo-500/40' : ''}`}
    >
      <div 
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ background: `linear-gradient(135deg, ${resolved.color}40, transparent, ${resolved.color}20)` }}
      />
      
 
      <div 
        className={`relative rounded-2xl overflow-hidden backdrop-blur-sm border transition-all duration-300
          ${isLocked 
            ? 'border-indigo-500/50 bg-slate-900/95' 
            : 'border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-800/90 group-hover:border-slate-600/80'
          }`}
      >
        <div 
          className="h-[6px] w-full"
          style={{ background: `linear-gradient(90deg, ${resolved.color}, ${resolved.color}60, transparent)` }}
        />

        <div className="px-7 py-6">
          <div className="flex items-center gap-5">
            {/* Icon container with subtle gradient background */}
            <div 
              className="relative p-4 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundColor: `${resolved.color}15`,
                boxShadow: `0 0 24px ${resolved.color}10`
              }}
            >
              <div 
                className="absolute inset-0 rounded-xl opacity-30"
                style={{ 
                  background: `radial-gradient(circle at 30% 30%, ${resolved.color}20, transparent 70%)`
                }}
              />
              <div className="relative w-12 h-12 flex items-center justify-center">
                <DynamicIcon name={resolved.icon} color={resolved.color} size="w-10 h-10" />
              </div>
            </div>
            
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <span 
                className="font-semibold text-[30px] text-white truncate leading-snug tracking-tight"
                title={data.label} 
              >
                {data.label}
              </span>
              <span 
                className="text-[23px] font-medium tracking-wider uppercase"
                style={{ color: `${resolved.color}cc` }}
              >
                {category}
              </span>
            </div>

            {/* <div className="shrink-0 flex items-center">
              {isOffline ? (
                <div className="w-3 h-3 rounded-full bg-red-500/80 ring-2 ring-red-500/20" />
              ) : (
                <div className="relative">
                  <div 
                    className="w-3 h-3 rounded-full ring-2"
                    style={{ 
                      backgroundColor: `${resolved.color}90`,
                      boxShadow: `0 0 10px ${resolved.color}40`,
                      ringColor: `${resolved.color}20`
                    }}
                  />
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="absolute -top-2.5 -right-2.5 bg-indigo-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-indigo-400/30">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          {data.lockedBy}
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-5 !h-5 !bg-slate-600 !border-[3px] !border-slate-900 !-top-[10px] !rounded-full transition-all hover:!bg-slate-400 hover:!scale-125" 
        style={{ boxShadow: '0 0 0 3px rgba(100, 116, 139, 0.15)' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-5 !h-5 !bg-slate-600 !border-[3px] !border-slate-900 !-bottom-[10px] !rounded-full transition-all hover:!bg-slate-400 hover:!scale-125" 
        style={{ boxShadow: '0 0 0 3px rgba(100, 116, 139, 0.15)' }}
      />
    </div>
  );
}