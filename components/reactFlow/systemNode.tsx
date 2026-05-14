"use client"

import { Handle, Position, NodeProps } from 'reactflow';
import { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { getIconForLabel } from '@/lib/icon-utils'; 

interface IconProps {
  name: string;
  color: string;
}

const fallbackIcon = 'server';

const DynamicIcon = ({ name, color }: IconProps) => {
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().trim();

  const isValidIcon = kebabName in dynamicIconImports;
  
  const iconToLoad = isValidIcon ? kebabName : fallbackIcon;
  const iconImport = dynamicIconImports[iconToLoad as keyof typeof dynamicIconImports];

  const IconComponent = useMemo(() => {
    return lazy(iconImport);
  }, [iconImport]);

  return (
    <Suspense fallback={<div className="w-7 h-7 bg-slate-100 animate-pulse rounded" />}>
      <IconComponent className="w-7 h-7" style={{ color }} />
    </Suspense>
  );
};

export function SystemNode({ data }: NodeProps) {
  const isLocked = !!data.lockedBy
  
  const resolved = data.icon ? 
    { icon: data.icon, color: data.color || '#64748b' } : 
    getIconForLabel(data.label);

  const isOffline = data.flag === 'offline';

  return (
    <div 
      className={`relative shadow-xl rounded-3xl bg-white dark:bg-slate-900 min-w-[400px] min-h-[140px] py-4 border-2 border-slate-200 dark:border-slate-700/80 transition-all hover:shadow-2xl hover:scale-[1.02]
        ${isOffline ? "opacity-50 border-red-500/50" : ""}
        ${isLocked ? 'border-indigo-500 ring-2 ring-indigo-500/20 opacity-90' : ''}`}
      style={{ borderLeftWidth: '7px', borderLeftColor: isOffline ? '#ef4444' : resolved.color }}
    >
      
      {isLocked && (
        <div className="absolute -top-3.5 right-2.5 bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm z-50 flex items-center gap-1.5">
          👤 {data.lockedBy}
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-7 !h-7 !bg-slate-400 dark:!bg-slate-500 !border-[3px] !border-white dark:!border-slate-900 z-50 !-top-[14px] !rounded-full" 
        style={{ boxShadow: '0 0 0 3px rgba(148, 163, 184, 0.3)' }}
      />
      <div className="flex flex-row items-center px-5 py-3 gap-5">
        
        <div 
          className="p-4 rounded-2xl shrink-0"
          style={{ backgroundColor: `${resolved.color}20` }}
        >
          <div className="w-11 h-11 flex items-center justify-center">
             <DynamicIcon name={resolved.icon} color={resolved.color} />
          </div>
        </div>
        
        <div className="flex flex-col justify-center overflow-hidden w-full gap-1.5">
          <span 
            className="font-sans text-[22px] font-bold text-black dark:text-white truncate w-full leading-tight antialiased"
            title={data.label} 
          >
            {data.label}
          </span>
          <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest antialiased">
            {data.label.toLowerCase().includes('database') ? 'Database' : 
             data.label.toLowerCase().includes('db') ? 'Database' :
             data.label.toLowerCase().includes('cache') ? 'Cache' :
             data.label.toLowerCase().includes('api') ? 'API Endpoint' :
             data.label.toLowerCase().includes('service') ? 'Service' :
             data.label.toLowerCase().includes('queue') ? 'Message Queue' : 'Component'}
          </span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-7 !h-7 !bg-slate-400 dark:!bg-slate-500 !border-[3px] !border-white dark:!border-slate-900 z-50 !-bottom-[14px] !rounded-full" 
        style={{ boxShadow: '0 0 0 3px rgba(148, 163, 184, 0.3)' }}
      />
    </div>
  );
}