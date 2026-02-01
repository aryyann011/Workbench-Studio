"use client"

import { Handle, Position, NodeProps } from 'reactflow';
// 1. New Imports: Lazy loading tools
import { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports'; // The secret sauce

// 2. Define the Icon Component outside to prevent re-creation
// This component handles the "Lazy Fetching" of the specific icon file
const DynamicIcon = ({ name, color }: { name: string, color: string }) => {
  // Logic: Lucide keys are "kebab-case" (e.g., "message-square"), not "PascalCase".
  // The AI or our parser might give "MessageSquare". We need to fix that.
  const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  
  // Check if valid icon exists in Lucide's registry
  const iconImport = dynamicIconImports[kebabName as keyof typeof dynamicIconImports];

  // Memoize the lazy component so it doesn't flicker on re-renders
  const IconComponent = useMemo(() => {
    return iconImport ? lazy(iconImport) : null;
  }, [iconImport]);

  // Fallback if icon name is invalid (e.g., "Skibidi")
  if (!IconComponent) {
    // We can fallback to a static "Server" icon here, but for now let's just return a generic box
    // Ideally, you'd import a static fallback icon at the top
    return <div className="w-6 h-6 bg-slate-200 rounded-md" />; 
  }

  return (
    <Suspense fallback={<div className="w-6 h-6 bg-slate-100 animate-pulse rounded" />}>
      <IconComponent className="w-6 h-6" style={{ color }} />
    </Suspense>
  );
};

// 3. The Main Node Component
export function SystemNode({ data }: NodeProps) {
  
  // Resolving the Icon Name
  // Priority: AI Provided Icon > Hardcoded Category > Label Name
  const iconName = data.icon || data.nodeType || data.label || "server";
  
  // Resolve Color
  const accentColor = data.color || '#64748b'; 
  const isOffline = data.flag === 'offline';

  return (
    <div 
      className={`shadow-xl rounded-lg bg-white dark:bg-slate-950 min-w-[140px] border-2 transition-all
        ${isOffline ? "border-red-500/50" : ""}`}
      style={{ borderColor: isOffline ? undefined : `${accentColor}40` }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />

      <div className="flex flex-col items-center p-4 gap-3">
        
        {/* Icon Container */}
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {/* 4. Use the Dynamic Component */}
          <DynamicIcon name={iconName} color={accentColor} />
        </div>
        
        <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
}