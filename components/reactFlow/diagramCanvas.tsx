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
  const { isConnected, channel } = useWorkspaceSocket(workspaceId);

  const lastUpdate = useRef<number>(0);

  const handlePointerMove = (e: React.MouseEvent) => {
      if (!isConnected || !channel) return;

      // 2. Get the current time in milliseconds
      const now = Date.now();

      // 3. THE THROTTLE: If less than 50ms have passed since the last update, ignore the mouse move
      if (now - lastUpdate.current < 50) return;

      // 4. Update the timer
      lastUpdate.current = now;

      console.log("Broadcasting:", e.clientX, e.clientY);
      // 5. Send the X and Y coordinates to Supabase
      channel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: { 
          x: e.clientX, 
          y: e.clientY 
        },
      }).then((resp) => {
          // This will tell us immediately if Supabase rejects the message
          if (resp !== 'ok') console.log("Network rejected message:", resp);
      });
  };

  if(isConnected) console.log("successfullly subscribed")

  return (
    <div  className="h-[100%] w-full bg-slate-50 dark:bg-slate-900">
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
        onPaneMouseMove={handlePointerMove}
        fitView
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
        <MiniMap 
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
          maskColor="rgba(0,0,0, 0.1)"
          style={{
            height: 100, 
            width: 150,
          }}
          zoomable 
          pannable 
        />
      </ReactFlow>
    </div>
  );
}