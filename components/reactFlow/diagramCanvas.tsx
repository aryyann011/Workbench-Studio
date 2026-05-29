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
import { useAuth } from '@clerk/nextjs';
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
  const workspaceId = propWorkspaceId || (params.id as string) 
  const {nodes, edges, onNodesChange, onEdgesChange,onConnect, deleteNode, undoTheActiion, RedoTheAction, NodeMovementTracker} = useAppStore()
  
  const {screenToFlowPosition, flowToScreenPosition, fitView} = useReactFlow()
  const { isConnected, channel, cursors } = useWorkspaceSocket(workspaceId);

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

  const handlePointerMove = (e: React.MouseEvent) => {
      if (!isConnected || !channel) return;

      const now = Date.now();
      if (now - lastUpdate.current < 50) return;
      lastUpdate.current = now;

      const newPosition = screenToFlowPosition({x : e.clientX, y : e.clientY})
      channel.send({
          type: 'broadcast',
          event: 'cursor-move',
          payload: {
              x: newPosition.x,
              y: newPosition.y,
              userId: userId
          },
      });
  };

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
    <div onPointerMove={handlePointerMove} className="relative h-[100%] w-full bg-slate-50 dark:bg-black">
      
      {Object.entries(cursors).map(([id, cursor]) => {
        const changedPosition = flowToScreenPosition({x : cursor.x, y : cursor.y});
        return (
          <div
            key={id}
            className="fixed top-0 left-0 z-50 transition-transform duration-75"
            style={{
                transform: `translate(${changedPosition.x}px, ${changedPosition.y}px)`,
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