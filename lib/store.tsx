import { create } from 'zustand'; 
import { Node, Edge, OnNodesChange, OnEdgesChange, applyEdgeChanges, applyNodeChanges } from 'reactflow'; 

interface AppState {
  nodes: Node[];
  edges: Edge[];
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  onNodesChange : OnNodesChange;
  onEdgesChange : OnEdgesChange;
}


export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],

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
  };

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