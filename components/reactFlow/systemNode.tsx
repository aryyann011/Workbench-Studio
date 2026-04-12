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
    <Suspense fallback={<div className="w-6 h-6 bg-slate-100 animate-pulse rounded" />}>
      <IconComponent className="w-6 h-6" style={{ color }} />
    </Suspense>
  );
};

export function SystemNode({ data }: NodeProps) {
 
  const resolved = data.icon ? 
    { icon: data.icon, color: data.color || '#64748b' } : 
    getIconForLabel(data.label);

  const isOffline = data.flag === 'offline';

  return (
    <div 
      className={`shadow-lg rounded-md bg-white dark:bg-slate-900 min-w-[280px] min-h-[90px] py-2 border border-slate-200 dark:border-slate-800 transition-all
        ${isOffline ? "opacity-50 border-red-500/50" : ""}`}
      style={{ borderLeftWidth: '5px', borderLeftColor: isOffline ? '#ef4444' : resolved.color }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-500 !border-none !-left-1" />

      <div className="flex flex-row items-center p-3 gap-3">
        
        <div 
          className="p-2 rounded-md shrink-0"
          style={{ backgroundColor: `${resolved.color}15` }}
        >
          <div className="w-5 h-5 flex items-center justify-center">
             <DynamicIcon name={resolved.icon} color={resolved.color} />
          </div>
        </div>
        
        <div className="flex flex-col justify-center overflow-hidden w-full">
          <span 
            className="font-sans text-lg font-semibold text-slate-800 dark:text-slate-100 truncate w-full"
            title={data.label} 
          >
            {data.label}
          </span>
        </div>

      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-500 !border-none !-right-1" />
    </div>
  );
}