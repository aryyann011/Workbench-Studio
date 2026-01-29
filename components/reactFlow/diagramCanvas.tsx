"use client"

import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SystemNode } from './systemNode';
import { useAppStore } from '@/lib/store';

const nodeTypes = {
  system: SystemNode,
};

export const BaseEditor = () => {
  const {nodes, edges, onNodesChange, onEdgesChange} = useAppStore()

  return (
    <div className="h-[100%] w-full bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        
        nodeTypes={nodeTypes}
        
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: '#64748b' }
        }}
        
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
        <MiniMap 
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
          maskColor="rgba(0,0,0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}