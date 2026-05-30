"use client"

import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ConnectionMode,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Connection,
  NodeChange,
  Panel
} from 'reactflow';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'reactflow/dist/style.css';
import { SystemNode } from './systemNode';
import { useAppStore } from '@/lib/store';
import { SystemGroupNode } from './systemGroupNode';
import { useWorkspaceSocket } from '@/hooks/useWorkspaceSocket';
import { useParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { toPng } from 'html-to-image';
import { useTheme } from 'next-themes';

const nodeTypes = {
  system: SystemNode,
  group : SystemGroupNode
};
type position = {
  x : number,
  y : number
}

type dragState = {
  start  : position | null,
  end : position | null
}

const EditorContent = ({ readOnly = false, workspaceId: propWorkspaceId }: { readOnly?: boolean; workspaceId?: string }) => {
  const params = useParams()
  const { theme } = useTheme()
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    nodeId: string | null;
  }>({ isOpen: false, x: 0, y: 0, nodeId: null });
  const [dragState, setDragState] = useState<dragState>({
    start : null,
    end : null
  })
  const [isInteractive, setIsInteractive] = useState(!readOnly)

  const {userId} = useAuth()
  const {user} = useUser()
  const workspaceId = propWorkspaceId || (params.id as string) 
  const {nodes, edges, onNodesChange, onEdgesChange,onConnect, deleteNode, undoTheActiion, RedoTheAction, NodeMovementTracker} = useAppStore()
  
  const {screenToFlowPosition, flowToScreenPosition, fitView} = useReactFlow()
  const { isConnected, channel, cursors, presence } = useWorkspaceSocket(workspaceId, userId);

  const lastCursorSend = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!channel || !isConnected || !userId) return;
    const now = Date.now();
    if (now - lastCursorSend.current < 50) return; // 50ms throttle
    lastCursorSend.current = now;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    channel.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: { x: position.x, y: position.y, userId, userName: user?.firstName || 'User' }
    });
  }, [channel, isConnected, userId, screenToFlowPosition, user]);

  const lastUpdate = useRef<number>(0);
  const prevNodeCount = useRef<number>(nodes.length);

  // Auto-fit the view when node count changes (new architecture generated)
  useEffect(() => {
    if (nodes.length > 0 && nodes.length !== prevNodeCount.current) {
      prevNodeCount.current = nodes.length;
      // Delay to let ReactFlow render the new nodes before fitting
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 200);
      return () => clearTimeout(timer);
    }
    prevNodeCount.current = nodes.length;
  }, [nodes.length, fitView]);

  const handleThePopUpPosition = (e: React.MouseEvent, node: any) => {
  e.preventDefault();
  setMenuState({
    isOpen: true,
    x: e.clientX,
    y: e.clientY,
    nodeId: node.id,
  });
};
  const handleNodeDragStart = (e : React.MouseEvent, node : any) => {
    setDragState(prev => ({
      ...prev, start : {x : node.position.x, y : node.position.y}
    }))

    if(!channel || !isConnected) return;

    channel.send({
      type : 'broadcast',
      event : 'node-start',
      payload : {
        nodeId : node.id,
        userId : userId
      }
    })
  }
  const handlePaneClick = () => {
    setMenuState({ ...menuState, isOpen: false });
  };
  const handleEdgeCreation = (connection: Connection) => {

    onConnect(connection)

    if(!channel || !isConnected) return;

    channel.send({
      type : 'broadcast',
      event : 'edge-create',
      payload : {
        Connection : connection
      }
    })
  }

  const handleNodeDragStop = (e : React.MouseEvent, node : any) => {
    setDragState(prev => ({
      ...prev, end : {x : node.position.x, y : node.position.y}
    }))

    if(userId)
    NodeMovementTracker(userId, node.id, dragState)


    if(!channel || !isConnected) return;

    channel.send({
      type : 'broadcast',
      event : 'node-stop',
      payload : {
        nodeId : node.id,
        
      }
    })
  }

  const deleteNodeManually = (Id : string) => {
    if (!userId) return;
    deleteNode(Id, userId);

    if (channel && isConnected) {
      channel.send({
        type: 'broadcast',
        event: 'node-delete', 
        payload: { nodeId: Id }
      });
    }
  }
  const undoTheaction = () => {
    undoTheActiion(userId)

    if (channel && isConnected) {
      const { nodes, edges } = useAppStore.getState(); 
      channel.send({
        type: 'broadcast',
        event: 'sync-timeline',
        payload: { nodes, edges }
      });
    }
  }
  const RedoTheaction = () => {
    RedoTheAction(userId)

    if (channel && isConnected) {
      const { nodes, edges } = useAppStore.getState();
      channel.send({
        type: 'broadcast',
        event: 'sync-timeline',
        payload: { nodes, edges }
      });
    }
  }
  const downloadArchitecture = () => {
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;

    const isDark = theme === 'dark';
    toPng(element, {
      backgroundColor: isDark ? '#000000' : '#ffffff', 
      pixelRatio: 3,
      quality: 1, 
    })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', `architecture-${workspaceId}.png`);
        a.setAttribute('href', dataUrl);
        a.click();
      })
      .catch((err) => {
        console.error('Failed to export architecture:', err);
      });
  };
  const handleNodesChange = (changes : NodeChange[]) => {
    onNodesChange(changes)

    if(!isConnected || !channel){
      return;
    }

    changes.forEach((change) => {
      if(change.type === 'position' && change.position){
        channel.send({
          type : 'broadcast',
          event : 'node-move',
          payload : {
            nodeId : change.id,
            position : change.position
          }
        })
      }
    })
  }

  return (
    <div className="relative h-[100%] w-full bg-slate-50 dark:bg-black" onMouseMove={handleMouseMove}>
      
      {/* Render Cursors */}
      {Object.entries(cursors).map(([id, cursor]) => {
        // Convert diagram coordinates back to screen space for overlay rendering
        const screenPos = flowToScreenPosition({ x: cursor.x, y: cursor.y });
        return (
          <div
            key={id}
            className="absolute z-50 pointer-events-none transition-all duration-75"
            style={{
              left: screenPos.x,
              top: screenPos.y,
            }}
          >
            {/* SVG Cursor matching the standard design */}
            <svg
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="drop-shadow-md text-indigo-500"
              style={{ fill: 'currentColor' }}
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7871 12.3673H5.65376Z" />
            </svg>
            <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap w-max ml-3 shadow-md">
              Collaborator
            </div>
          </div>
        );
      })}
      {menuState.isOpen && !readOnly && (
        <div
          className="fixed z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md p-1 min-w-[150px]"
          style={{ top: menuState.y, left: menuState.x }}
        >
          <button
            onClick={() => {
              if (menuState.nodeId) {
                deleteNodeManually(menuState.nodeId); 
                setMenuState({ ...menuState, isOpen: false });
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors font-medium"
          >
            Delete Node
          </button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.15} 
        maxZoom={1000}
        onNodeContextMenu={handleThePopUpPosition}
        nodeTypes={nodeTypes}
        panOnScroll={false}         
        zoomOnScroll={true}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        nodesDraggable={isInteractive && !readOnly}
        nodesConnectable={isInteractive && !readOnly}
        panOnDrag={true}
        onPaneClick={handlePaneClick}
        edgesUpdatable={isInteractive && !readOnly}
        onlyRenderVisibleElements={true}
        defaultEdgeOptions={{
          type : 'smoothstep',
          markerEnd : { 
            type: MarkerType.ArrowClosed, 
            width: 24, 
            height: 24, 
            color: '#94a3b8' 
          },
          style : { strokeWidth: 2.5, stroke: '#94a3b8' }
        }}
        connectionMode={ConnectionMode.Loose}
        onConnect={handleEdgeCreation}
        fitView
        fitViewOptions={{ minZoom: 0.7, padding: 0.1 }}
      >
        {!readOnly && (
        <Panel
          position="bottom-left"
          style={{
            left: '16%',
            transform: 'translateX(-50%)',
          }}
          className="flex gap-2 m-4"
        >
          <button
            onClick={undoTheaction} 
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center group"
            title="Undo (Ctrl+Z)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-active:-translate-x-1 transition-transform">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          
          <button
            onClick={RedoTheaction} 
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center group"
            title="Redo (Ctrl+Y)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-active:translate-x-1 transition-transform">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
          
          <button
            onClick={downloadArchitecture}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center font-medium text-sm gap-2 active:scale-95"
            title="Export as PNG"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PNG
          </button>
        </Panel>
        )}
        <Background color="#475569" gap={28} size={1.5} />
        <Controls 
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
          showInteractive={false}
        />
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

export const BaseEditor = ({ readOnly = false, workspaceId }: { readOnly?: boolean; workspaceId?: string }) => {
  return(
    <ReactFlowProvider>
      <EditorContent readOnly={readOnly} workspaceId={workspaceId} />
    </ReactFlowProvider>
  )
}