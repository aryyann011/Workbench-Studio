import { create } from 'zustand'; 
import { Node, Edge } from 'reactflow'; 


interface AppState {
  nodes: Node[];
  edges: Edge[];
  setGraph: (nodes: Node[], edges: Edge[]) => void;
}


export const useAppStore = create<AppState>((set) => ({
  nodes: [],
  edges: [],

  setGraph: (nodes, edges) => set({ nodes, edges }),
}));