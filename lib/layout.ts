import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge, Position } from 'reactflow';

// Initialize the ELK engine
const elk = new ELK();

// Define standard sizes so the math engine knows how to space things
const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  // 1. Define the Math Rules (The ELK Config)
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',          // The standard hierarchical flowchart algorithm
      'elk.direction': 'DOWN',             // Top-to-Bottom flow
      'elk.spacing.nodeNode': '75',        // Horizontal gap between nodes
      'elk.layered.spacing.nodeNodeBetweenLayers': '100', // Vertical gap
    },
    
    // 2. Translate React Flow Nodes -> ELK Nodes
    children: nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    
    // 3. Translate React Flow Edges -> ELK Edges
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    // 4. THE MATH HAPPENS HERE (This runs the algorithm)
    const layoutedGraph = await elk.layout(graph);

    // 5. Translate ELK Nodes back to React Flow Nodes
    const layoutedNodes = nodes.map((node) => {
      // Find the specific node ELK just calculated
      const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);

      if (!elkNode) return node;

      return {
        ...node,
        targetPosition: Position.Top,    // Arrows come in the top
        sourcePosition: Position.Bottom, // Arrows go out the bottom
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error("ELK Layout Error:", error);
    return { nodes, edges }; // Fallback to original if math fails
  }
};