"use client"

import { useState } from 'react';
import { create } from 'zustand'; 
import { Node, Edge, OnNodesChange, OnEdgesChange, applyEdgeChanges, applyNodeChanges, addEdge } from 'reactflow'; 
import { parseCode } from './parser';
import { getLayoutedElements } from './layout';
import { promises } from 'dns';
import { Connection } from 'reactflow';

interface AppState {
  nodes: Node[];
  edges: Edge[];
  code : string
  setCode : (code : string) => void

  updateNodeData : (id : string, data : any) => void;
  generateGraph: () => Promise<void>;
  fetchGraph: () => Promise<void>;
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
}

export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
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

  fetchGraph: async () => {
    const {code} = get()

    

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

  handleNodeStop: async (nodeId) => {
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