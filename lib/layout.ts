import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 500;  
const NODE_HEIGHT = 160; 

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  
  const nodeParentMap = new Map<string, string | undefined>();
  nodes.forEach(n => nodeParentMap.set(n.id, n.parentNode));

  const groupInternalEdges = new Map<string, any[]>();
  const rootEdges: any[] = [];

  edges.forEach(edge => {
    const sourceParent = nodeParentMap.get(edge.source);
    const targetParent = nodeParentMap.get(edge.target);

    if (sourceParent && targetParent && sourceParent === targetParent) {
      if (!groupInternalEdges.has(sourceParent)) {
        groupInternalEdges.set(sourceParent, []);
      }
      groupInternalEdges.get(sourceParent)!.push({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      });
    } else {
      rootEdges.push({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      });
    }
  });

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
        elkNode.edges = groupInternalEdges.get(node.id) || [];
        elkNode.layoutOptions = {
          'elk.algorithm': 'layered',
          'elk.direction': 'DOWN',
          'elk.edgeRouting': 'ORTHOGONAL',
          'elk.padding': '[top=100,left=70,bottom=70,right=70]',
          'elk.spacing.nodeNode': '90', 
          'elk.layered.spacing.nodeNodeBetweenLayers': '130',
          'elk.spacing.edgeNode': '60',
          'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          'elk.layered.cycleBreaking.strategy': 'GREEDY',
          'elk.layered.compaction.postCompaction.strategy': 'NONE',
          'elk.nodeSize.constraints': 'MINIMUM_SIZE',
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
      'elk.direction': 'DOWN', 
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      
      'elk.aspectRatio': '1.6',
      
      'elk.spacing.componentComponent': '220',
      'elk.layered.spacing.nodeNodeBetweenLayers': '260', 
      'elk.spacing.nodeNode': '180',        
      
      'elk.spacing.edgeNode': '100',
      'elk.spacing.edgeEdge': '40',
      
      'elk.separateConnectedComponents': 'true',
      'elk.layered.compaction.postCompaction.strategy': 'NONE',
      
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
    },
    children: elkChildren, 
    edges: rootEdges,
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
