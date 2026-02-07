"use client"

import { useState } from 'react';
import { create } from 'zustand'; 
import { Node, Edge, OnNodesChange, OnEdgesChange, applyEdgeChanges, applyNodeChanges } from 'reactflow'; 
import { parseCode } from './parser';



interface AppState {
  nodes: Node[];
  edges: Edge[];
  code : string
  setCode : (code : string) => void

  updateNodeData : (id : string, data : any) => void;
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  onNodesChange : OnNodesChange;
  onEdgesChange : OnEdgesChange;
}


export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  code : "",

  setCode : (input) =>{

    set({code : input})
    const { nodes: newNodes, edges: newEdges } = parseCode(input);

    const currentNodes = get().nodes;

    const mergedNodes = newNodes.map((newNode) => {
      const existingNode = currentNodes.find((n) => n.id === newNode.id);
      
      if (existingNode) {
        return {
          ...newNode,
          position: existingNode.position
        };
      }
      
      return newNode;
    });

    set({ nodes: mergedNodes, edges: newEdges });
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
  setGraph: (newNodes, newEdges) => {
    const currentNodes = get().nodes;

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