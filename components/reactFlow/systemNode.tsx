"use client"

import { Handle, Position, NodeProps } from 'reactflow';
import { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { getIconForLabel } from '@/lib/icon-utils'; // 👈 IMPORT THE BRAIN

interface IconProps {
  name: string;
  color: string;
}

const fallbackIcon = 'server';

const DynamicIcon = ({ name, color }: IconProps) => {
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().trim();

  const isValidIcon = kebabName in dynamicIconImports;
  
  // 3. Pick the file (or fallback)
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
  // 🟡 THE CHANGE:
  // Instead of passively waiting, we actively calculate the icon using our utility.
  // This ensures 'Kafka' gets 'message-square' instantly.
  const resolved = data.icon ? 
    { icon: data.icon, color: data.color || '#64748b' } : 
    getIconForLabel(data.label);

  const isOffline = data.flag === 'offline';

  return (
    <div 
      className={`shadow-xl rounded-lg bg-white dark:bg-slate-950 min-w-[140px] border-2 transition-all
        ${isOffline ? "border-red-500/50" : ""}`}
      style={{ borderColor: isOffline ? undefined : `${resolved.color}40` }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />

      <div className="flex flex-col items-center p-4 gap-3">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${resolved.color}15` }}
        >
          {/* We pass the calculated 'resolved.icon' here */}
          <DynamicIcon name={resolved.icon} color={resolved.color} />
        </div>
        
        <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
}