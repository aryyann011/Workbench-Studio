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

// 1. REGISTER CUSTOM NODES
const nodeTypes = {
  system: SystemNode,
};

// 2. TEST DATA: NODES (3 distinct types to test icons)
const initialNodes = [
  { 
    id: '1', 
    type: 'system', 
    position: { x: 250, y: 0 }, 
    data: { label: 'User Client', nodeType: 'client', flag : 'offline' } 
  },
  { 
    id: '2', 
    type: 'system', 
    position: { x: 250, y: 200 }, 
    data: { label: 'API Gateway', nodeType: 'server', flag : 'offline' } 
  },
  { 
    id: '3', 
    type: 'system', 
    position: { x: 250, y: 400 }, 
    data: { label: 'Primary DB', nodeType: 'database', flag : 'online' } 
  },
  { 
    id: '4', 
    type: 'system', 
    position: { x: 500, y: 400 }, 
    data: { label: 'Redis Cache', nodeType: 'database', flag : 'offline' } 
  },
  {
    id : '5',
    type : 'system',
    position : {x : 100, y : 200},
    data : {label : 'Firewall', nodeType : 'firewall', flag : 'offline'}
  }
];

// 3. TEST DATA: EDGES (Connecting them)
const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true, // Animates the flow
    label: 'Request' 
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    type: 'smoothstep', // Makes the line square-ish like a circuit
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed }, // Adds an arrow head,
    markerStart : {type : MarkerType.ArrowClosed }
  },
];

export const BaseEditor = () => {
  // We use hooks so the graph is interactive (draggable/selectable)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[100%] w-full bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        
        // Critical: Registers our custom component
        nodeTypes={nodeTypes}
        
        // Aesthetics: Makes edges look professional by default
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