"use client"

import { Handle, Position, NodeProps } from 'reactflow';
// Lucide icons: Standard SVG icons for React
import { 
  Database, 
  Server, 
  Laptop, 
  Cloud, 
  Smartphone, 
  Globe 
} from 'lucide-react'; 

// 1. The Icon Dictionary
// This maps a string (from our parser later) to a React Component (Icon)
const iconMap: Record<string, any> = {
  database: Database,
  db: Database,
  postgres: Database,
  server: Server,
  backend: Server,
  client: Laptop,
  frontend: Laptop,
  browser: Globe,
  mobile: Smartphone,
  cloud: Cloud,
  aws: Cloud,
  // Fallback: If we don't recognize the type, assume it's a generic Server
  default: Server 
};

export function SystemNode({ data }: NodeProps) {
  // 2. Logic: Resolve the Icon
  // We check if the 'nodeType' exists in our map. 
  // If not, we fall back to the 'default' icon.
  const Icon = iconMap[data.nodeType?.toLowerCase()] || iconMap.default;

  return (
    // The "Card" Container
    <div className="shadow-xl rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 min-w-[140px] transition-all hover:ring-2 hover:ring-blue-500/50">
      
      {/* Input Handle (Top) */}
      {/* This is the magnetic point where lines connect TO */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-950" 
      />

      <div className="flex flex-col items-center p-4 gap-3">
        {/* The Icon Container */}
        <div className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-100 dark:border-slate-800">
          <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </div>
        
        {/* The Label Text */}
        <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100 tracking-tight">
          {data.label}
        </span>
      </div>

      {/* Output Handle (Bottom) */}
      {/* This is the magnetic point where lines connect FROM */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-950" 
      />
    </div>
  );
}