import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 280;  
const NODE_HEIGHT = 100; 

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  
 
  const buildElkTree = (parentId?: string): any[] => {
    const currentLevelNodes = nodes.filter(n => 
      parentId ? n.parentNode === parentId : !n.parentNode
    );

    return currentLevelNodes.map(node => {
      const isGroup = node.type === 'group';
      const elkNode: any = { id: node.id };

      if (!isGroup) {
        elkNode.width = NODE_WIDTH;
        elkNode.height = NODE_HEIGHT;
      } else {
        elkNode.children = buildElkTree(node.id);
        elkNode.layoutOptions = {
          'elk.padding': '[top=120,left=80,bottom=80,right=80]',
          'elk.spacing.nodeNode': '100', 
          'elk.layered.spacing.nodeNodeBetweenLayers': '250',
          'elk.spacing.edgeNode': '80',
          'elk.spacing.edgeEdge': '80',
        };
      }
      return elkNode;
    });
  };

  const elkChildren = buildElkTree(undefined);

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',          
      'elk.direction': 'RIGHT', 
      'elk.edgeRouting': 'ORTHOGONAL',
      
      'elk.spacing.nodeNode': '100',        
      'elk.layered.spacing.nodeNodeBetweenLayers': '400', 
      
      'elk.spacing.edgeNode': '50',
      'elk.spacing.edgeEdge': '50',
      
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
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