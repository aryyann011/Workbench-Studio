"use client"

import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ConnectionMode,
  MarkerType
} from 'reactflow';
import { useRef } from 'react';
import 'reactflow/dist/style.css';
import { SystemNode } from './systemNode';
import { useAppStore } from '@/lib/store';
import { SystemGroupNode } from './systemGroupNode';
import { useWorkspaceSocket } from '@/hooks/useWorkspaceSocket';
import { useParams } from 'next/navigation';

const nodeTypes = {
  system: SystemNode,
  group : SystemGroupNode
};

export const BaseEditor = () => {
  const params = useParams()
  const workspaceId = params.id as string 
  const {nodes, edges, onNodesChange, onEdgesChange} = useAppStore()
  
  const { isConnected, channel, cursors } = useWorkspaceSocket(workspaceId);

  const myUserId = useRef(`user_${Math.floor(Math.random() * 10000)}`).current;
  
  const lastUpdate = useRef<number>(0);

  const handlePointerMove = (e: React.MouseEvent) => {
      if (!isConnected || !channel) return;

      const now = Date.now();
      if (now - lastUpdate.current < 50) return;
      lastUpdate.current = now;

      channel.send({
          type: 'broadcast',
          event: 'cursor-move',
          payload: {
              x: e.clientX,
              y: e.clientY,
              userId: myUserId
          },
      });
  };

  return (
    <div className="relative h-[100%] w-full bg-slate-50 dark:bg-slate-900">
      
      {Object.entries(cursors).map(([id, cursor]) => (
        <div
            key={id}
            className="absolute top-0 left-0 z-50 transition-transform duration-75"
            style={{
                transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                pointerEvents: 'none', 
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 36" fill="none" stroke="white" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.65376 21.1597L1.6968 4.20455C1.19254 2.04353 3.51865 0.320499 5.37854 1.48203L22.1852 11.9868C24.0841 13.1736 23.7051 16.0963 21.5036 16.5925L14.7335 18.1189C14.3917 18.1959 14.0953 18.396 13.9113 18.6811L10.3707 24.1678C9.17726 26.0177 6.24151 23.6782 5.65376 21.1597Z" fill="#E11D48"/>
            </svg>
            <div className="absolute left-5 top-5 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                {id}
            </div>
        </div>
      ))}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.01} 
        maxZoom={1000}
        nodeTypes={nodeTypes}
        panOnScroll={false}         
        zoomOnScroll={true}
        panOnDrag={true}
        selectionOnDrag={false}
        onlyRenderVisibleElements={true}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: '#64748b' }
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
        onPaneMouseMove={handlePointerMove} 
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
        <MiniMap 
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
          maskColor="rgba(0,0,0, 0.1)"
          style={{ height: 100, width: 150 }}
          zoomable 
          pannable 
        />
      </ReactFlow>
    </div>
  );
}