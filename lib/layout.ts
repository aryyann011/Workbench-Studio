import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  
  const topLevelNodes = nodes.filter(node => !node.parentNode);

  const elkChildren = topLevelNodes.map((node) => {
    
    const elkNode: any = {
      id: node.id,
      width: node.type === 'group' ? 400 : NODE_WIDTH,
      height: node.type === 'group' ? 400 : NODE_HEIGHT,
    };

    if (node.type === 'group') {
      
      const innerNodes = nodes.filter(child => child.parentNode === node.id);
      
      elkNode.children = innerNodes.map(child => ({
        id: child.id,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }));

      elkNode.layoutOptions = {
        'elk.padding': '[top=50,left=50,bottom=50,right=50]'
      };
    }

    return elkNode;
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',          
      'elk.direction': 'DOWN',             
      'elk.spacing.nodeNode': '75',        
      'elk.layered.spacing.nodeNodeBetweenLayers': '100', 
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
        targetPosition: Position.Top,    
        sourcePosition: Position.Bottom, 
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