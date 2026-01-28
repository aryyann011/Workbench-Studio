import { Node, Edge, MarkerType } from 'reactflow';

export const parseCode = (input: string) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const parsedLines = input.split('\n');

  parsedLines.forEach((line, index) => {
    // 1. Clean the line (remove extra spaces)
    const trimmedLine = line.trim();
    if (!trimmedLine) return; // Skip empty lines

    // 🛑 LOGIC CHALLENGE FOR YOU:
    // We need a Regex that finds anything inside brackets [ ... ]
    // Try to figure this out on Regex101.com
    // Pattern: Literal '[', followed by Capturing Group (anything not a ']'), followed by Literal ']'
    const regex = \[(.*?)\]; 
    
    // Check if the line matches
    const match = trimmedLine.match(regex);

    if (match) {
      // match[1] will be the text INSIDE the brackets (e.g., "Client")
      const label = match[1]; 
      
      // Create the Node Object
      const newNode: Node = {
        id: label, // Use label as ID for now (simple)
        type: 'system',
        position: { x: 0, y: index * 100 }, // Temporary: Stack them vertically
        data: { 
          label: label, 
          nodeType: label.toLowerCase() // This triggers our IconMap!
        }
      };

      nodes.push(newNode);
    }
  });

  return { nodes, edges };
};