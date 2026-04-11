import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  
  // 1. THE RECURSIVE BUILDER (Fixes Fault 2)
  // This function digs as deep as it needs to, building infinite boxes-in-boxes.
  const buildElkTree = (parentId?: string): any[] => {
    const currentLevelNodes = nodes.filter(n => 
      parentId ? n.parentNode === parentId : !n.parentNode
    );

    return currentLevelNodes.map(node => {
      const isGroup = node.type === 'group';
      const elkNode: any = { id: node.id };

      // 2. THE AUTO-RESIZE FIX (Fixes Fault 1)
      // Only give exact sizes to the standard nodes. 
      // DO NOT give sizes to groups. Let ELK calculate how big they need to be!
      if (!isGroup) {
        elkNode.width = NODE_WIDTH;
        elkNode.height = NODE_HEIGHT;
      } else {
        // If it's a group, recursively fetch all its children
        elkNode.children = buildElkTree(node.id);
        elkNode.layoutOptions = {
          'elk.padding': '[top=60,left=60,bottom=60,right=60]'
        };
      }
      return elkNode;
    });
  };

  // Start the recursive build from the absolute root
  const elkChildren = buildElkTree(undefined);

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',          
      'elk.direction': 'RIGHT', 
      
      // 1. THE MAGIC WORD: Force 90-degree lines that avoid nodes
      'elk.edgeRouting': 'ORTHOGONAL',
      
      // 2. Tidy up the spacing so lines have room to travel
      'elk.spacing.nodeNode': '60',        
      'elk.layered.spacing.nodeNodeBetweenLayers': '120', 
      
      // 3. Force ELK to spend extra CPU cycles untangling crossed lines
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      
      // 4. Align nodes to a strict grid so it stops looking messy
      'elk.alignment': 'CENTER',
    },
    children: elkChildren, 
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    // Deep Search Extraction
    const getElkNode = (elkHierarchy: any, targetId: string): any => {
      if (!elkHierarchy.children) return null;
      for (const child of elkHierarchy.children) {
        if (child.id === targetId) return child;
        const foundInChildren = getElkNode(child, targetId);
        if (foundInChildren) return foundInChildren;
      }
      return null;
    };

    const layoutedNodes = nodes.map((node) => {
      const elkNode = getElkNode(layoutedGraph, node.id);

      if (!elkNode) return node;

      return {
        ...node,
        targetPosition: Position.Left,    
        sourcePosition: Position.Right, 
        
        // 3. APPLY THE CALCULATED SIZES TO REACT FLOW
        // Since ELK figured out how big the groups should be, we must apply that to the UI.
        style: node.type === 'group' ? {
          ...node.style,
          width: elkNode.width,
          height: elkNode.height,
        } : node.style,
        
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
      };
    });

    return { nodes: layoutedNodes, edges };

  } catch (error) {
    console.error("ELK Layout Error:", error);
    return { nodes, edges }; 
  }
};