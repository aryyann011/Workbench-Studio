"use client"

import { useState } from 'react';
import { create } from 'zustand'; 
import { Node, Edge, OnNodesChange, OnEdgesChange, applyEdgeChanges, applyNodeChanges } from 'reactflow'; 
import { parseCode } from './parser';
import { getLayoutedElements } from './layout';
import { promises } from 'dns';



interface AppState {
  nodes: Node[];
  edges: Edge[];
  code : string
  setCode : (code : string) => void

  updateNodeData : (id : string, data : any) => void;
  generateGraph: () => Promise<void>;
  onNodesChange : OnNodesChange;
  onEdgesChange : OnEdgesChange;
}


export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  code : "",

  setCode : (input) =>{
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