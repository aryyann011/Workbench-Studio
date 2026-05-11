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
      className={`relative shadow-xl rounded-xl bg-white dark:bg-slate-900 min-w-[340px] min-h-[110px] py-3 border-2 border-slate-200 dark:border-slate-700/80 transition-all hover:shadow-2xl
        ${isOffline ? "opacity-50 border-red-500/50" : ""}
        ${isLocked ? 'border-rose-500 ring-2 ring-rose-500/20 opacity-90 cursor-not-allowed' : ''}`}
      style={{ borderLeftWidth: '6px', borderLeftColor: isOffline ? '#ef4444' : resolved.color }}
    >
      
      {isLocked && (
        <div className="absolute -top-3 right-2 bg-rose-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm z-50 flex items-center gap-1">
          🔒 {data.lockedBy}
        </div>
      )}

      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-5 !h-5 !bg-slate-400 dark:!bg-slate-500 !border-[3px] !border-white dark:!border-slate-900 z-50 !-top-[10px] !rounded-full" 
        style={{ boxShadow: '0 0 0 2px rgba(148, 163, 184, 0.3)' }}
      />
      <div className="flex flex-row items-center px-4 py-2 gap-4">
        
        <div 
          className="p-3 rounded-lg shrink-0"
          style={{ backgroundColor: `${resolved.color}20` }}
        >
          <div className="w-7 h-7 flex items-center justify-center">
             <DynamicIcon name={resolved.icon} color={resolved.color} />
          </div>
        </div>
        
        <div className="flex flex-col justify-center overflow-hidden w-full gap-1">
          <span 
            className="font-sans text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate w-full leading-tight"
            title={data.label} 
          >
            {data.label}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {data.label.toLowerCase().includes('database') ? 'Database' : 
             data.label.toLowerCase().includes('service') ? 'Service' : 
             data.label.toLowerCase().includes('gateway') ? 'Gateway' :
             data.label.toLowerCase().includes('interface') ? 'Interface' :
             data.label.toLowerCase().includes('model') ? 'Model' :
             data.label.toLowerCase().includes('orchestrator') ? 'Orchestrator' :
             'Component'}
          </span>
        </div>

      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-5 !h-5 !bg-slate-400 dark:!bg-slate-500 !border-[3px] !border-white dark:!border-slate-900 z-50 !-bottom-[10px] !rounded-full" 
        style={{ boxShadow: '0 0 0 2px rgba(148, 163, 184, 0.3)' }}
      />
    </div>
  );
}