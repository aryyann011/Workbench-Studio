"use client"

import { useState } from 'react';
import { create } from 'zustand'; 
import { Node, Edge, OnNodesChange, OnEdgesChange, applyEdgeChanges, applyNodeChanges, addEdge } from 'reactflow'; 
import { parseCode } from './parser';
import { getLayoutedElements } from './layout';
import { promises } from 'dns';
import { Connection } from 'reactflow';

type Action = {
  type: "DELETE_NODE"; 
  userId: string | null | undefined;
  deletedNode: Node | undefined;   
  deletedEdges: Edge[];
} | {
  type : "MOVE_NODE";
  userId : string | null;
  nodeId : string;
  fromPosition : {x : number, y : number};
  toPosition : {x : number, y : number};
};
type position = {
  x : number,
  y : number
}

interface AppState {
  nodes: Node[];
  edges: Edge[];
  code : string
  setCode : (code : string) => void
  
  past : Action[]
  future : Action[]
  updateNodeData : (id : string, data : any) => void;
  generateGraph: () => Promise<void>;
  SetTheGraph: (
    nodes : Node[],
    edges : Edge[]
  ) => Promise<void>;
  onNodesChange : OnNodesChange;
  onEdgesChange : OnEdgesChange;
  handleRealtimeChanges: (
    nodeId: string,
    position: { x: number; y: number }
  ) => Promise<void>;
  handleNodeStart : (
    nodeId : string,
    userId : string
  ) => Promise<void>;
  handleNodeStop : (
    nodeId : string 
  ) => Promise<void>;
  onConnect : (
    connection  : Connection
  ) => void;
  deleteNode : (
    nodeId : string,
    userId : string
  ) => void;
  undoTheActiion : (userId: string | null | undefined) => void;
  RedoTheAction : (userId: string | null | undefined) => void;
  NodeMovementTracker : (
    userId: string | null,
    nodeId : string,
    dragState : {start : position | null, end : position | null}
  ) => void;
  removeNodeRemotely : (nodeId : string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  past : [],
  future : [],
  code : "",

  setCode : (input) => {
    set({code : input})
  },

  updateNodeData : (nodeId, newData) => {
    set({
      nodes : get().nodes.map((node) => {
        if(node.id === nodeId){
          return {...node, data : {...node.data, ...newData}}
        }

        return node;
      })
    })
  },

  generateGraph: async () => {
    const {code, nodes : currentNodes} = get()
    
    const {nodes : parsed_nodes, edges : parsed_edges} = parseCode(code)
    const {nodes : newNodes, edges : newEdges} = await getLayoutedElements(parsed_nodes, parsed_edges)
    const mergedNodes = newNodes.map((newNode) => {
    const existingNode = currentNodes.find((n) => n.id === newNode.id);

      if(existingNode){
        return {
          ...newNode,
          position : existingNode.position
        };
      }

      return newNode;
    });

    set({nodes : mergedNodes, edges : newEdges})
  },

  undoTheActiion: (userId) => {
    const { nodes, edges, past, future } = get();
    if (past.length === 0) return;

    const lastAction = past[past.length - 1];
    if (lastAction.userId !== userId) return; // 
    const newPast = past.slice(0, -1);

    let nextNodes = [...nodes];
    let nextEdges = [...edges];

    switch (lastAction.type) {
      case "DELETE_NODE":
        if (lastAction.deletedNode) nextNodes.push(lastAction.deletedNode);
        if (lastAction.deletedEdges.length > 0) nextEdges.push(...lastAction.deletedEdges);
        break;

      case "MOVE_NODE":
        nextNodes = nextNodes.map(node => 
          node.id === lastAction.nodeId 
            ? { ...node, position: lastAction.fromPosition } 
            : node
        );
        break;
    }

    set({
      past: newPast,
      future: [...future, lastAction],
      nodes: nextNodes,
      edges: nextEdges
    });
  },

  NodeMovementTracker : (userId, nodeId, dragState) => {
    const {past} = get()

    if (!dragState.start || !dragState.end) return;

    const newPastElement: Action = {
      type: "MOVE_NODE",
      userId,
      nodeId,
      fromPosition: dragState.start,
      toPosition: dragState.end
    };
    set({past : [...past, newPastElement],
      future : []
    })
  },
  removeNodeRemotely: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
  },

  RedoTheAction: (userId) => {
    const { nodes, edges, past, future } = get();
    if (future.length === 0) return; 

    const nextAction = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    let nextNodes = [...nodes];
    let nextEdges = [...edges];

    switch (nextAction.type) {
      case "DELETE_NODE":
        const nodeIdToDelete = nextAction.deletedNode?.id;
        nextNodes = nextNodes.filter(n => n.id !== nodeIdToDelete);
        nextEdges = nextEdges.filter(e => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete);
        break;

      case "MOVE_NODE":
        nextNodes = nextNodes.map(node => 
          node.id === nextAction.nodeId 
            ? { ...node, position: nextAction.toPosition} 
            : node
        );
        break;
    }

    set({
      past: [...past, nextAction],
      future: newFuture,
      nodes: nextNodes,
      edges: nextEdges
    });
  },

  SetTheGraph: async (nodes, edges) => {
    set({nodes : nodes, edges : edges})

  },
  deleteNode: (nodeId, userId) => {
    const { nodes, edges, past } = get();

    const nodeToDelete = nodes.find(n => n.id === nodeId);
    
    const connectedEdges = edges.filter(e => e.source === nodeId || e.target === nodeId);

    set({
      past: [...past, { 
        type: "DELETE_NODE", 
        userId: userId, 
        deletedNode: nodeToDelete, 
        deletedEdges: connectedEdges 
      }],
      future: [] 
    });

    set({
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
  },
  onConnect : (connection) => {
    set({
      edges : addEdge(connection, get().edges)
    })
  },

  handleRealtimeChanges: async (nodeId, position) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId 
          ? { ...node, position }
          : node
      ),
    });
  },

  handleNodeStart: async (nodeId, userId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              draggable: false, 
              data: { ...node.data, lockedBy: userId } 
            }
          : node
      ),
    });
  },

  handleNodeStop : async (nodeId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              draggable: true, 
              data: { ...node.data, lockedBy: undefined }
            }
          : node
      ),
    });
  },

  onNodesChange : (changes) => {
    set({
      nodes : applyNodeChanges(changes, get().nodes),
    })
  },
  
  onEdgesChange : (changes) => {
    set({
      edges : applyEdgeChanges(changes, get().edges),
    })
  }
}));