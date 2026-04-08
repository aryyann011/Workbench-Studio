import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

const elk = new ELK();

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  // STEP 1: Sort the Laundry
  // Find all nodes that are NOT inside a container. 
  // These are your "Baskets" (groups) and "Standalone Shirts".
  const topLevelNodes = nodes.filter(node => !node.parentNode);

  // STEP 2: Build the Nested Structure
  const elkChildren = topLevelNodes.map((node) => {
    
    // The basic shape ELK expects
    const elkNode: any = {
      id: node.id,
      width: node.type === 'group' ? 400 : NODE_WIDTH,
      height: node.type === 'group' ? 400 : NODE_HEIGHT,
    };

    // If this node is a Basket (group), we need to put the shirts inside it!
    if (node.type === 'group') {
      
      // Find all nodes that claim this group as their parent
      const innerNodes = nodes.filter(child => child.parentNode === node.id);
      
      // Format them for ELK and attach them to the 'children' property
      elkNode.children = innerNodes.map(child => ({
        id: child.id,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }));

      // Add padding so the container walls don't touch the children inside
      elkNode.layoutOptions = {
        'elk.padding': '[top=50,left=50,bottom=50,right=50]'
      };
    }

    return elkNode;
  });

  // STEP 3: The Main ELK Graph Object
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',          
      'elk.direction': 'DOWN',             
      'elk.spacing.nodeNode': '75',        
      'elk.layered.spacing.nodeNodeBetweenLayers': '100', 
    },
    children: elkChildren, // Pass our perfectly nested data here!
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    // STEP 4: Run the Math
    const layoutedGraph = await elk.layout(graph);

    // STEP 5: Deep Search Extraction
    // ELK gives us back a nested object. We need a helper function to find 
    // a node's coordinates, whether it's at the root or hiding inside a container.
    const getElkNode = (elkHierarchy: any, targetId: string): any => {
      if (!elkHierarchy.children) return null;
      
      for (const child of elkHierarchy.children) {
        if (child.id === targetId) return child;
        
        // If this child has its own children (it's a group), search inside it!
        const foundInChildren = getElkNode(child, targetId);
        if (foundInChildren) return foundInChildren;
      }
      return null;
    };

    // STEP 6: Apply the Math to React Flow
    const layoutedNodes = nodes.map((node) => {
      // Use our new deep search function
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