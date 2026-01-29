"use client"

import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Database, Server, Laptop, Cloud, Shield, Globe, Smartphone 
} from 'lucide-react'; 

export function SystemNode({ data }: NodeProps) {
  const lowerType = data.nodeType?.toLowerCase() || '';
  const matchedRule = categoryRules.find(r => 
    r.keywords.some(k => lowerType.includes(k))
  );
  const Icon = matchedRule ? matchedRule.icon : Server;
  
  const isOffline = data.flag === 'offline';

  return (
    <div className={`shadow-xl rounded-lg border bg-white dark:bg-slate-950 min-w-35 
      ${isOffline ? "border-red-500 border-2" : "border-slate-200 dark:border-slate-800"}`}>
      
      <Handle type="target" position={Position.Top} className="w-3! h-3! bg-slate-400!" />

      <div className="flex flex-col items-center p-4 gap-3">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </div>
        <span className="font-mono text-sm font-medium">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3! h-3! bg-slate-400!" />
    </div>
  );
}