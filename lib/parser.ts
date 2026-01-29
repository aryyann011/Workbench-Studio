import { Node, Edge } from 'reactflow';

export const parseCode = (input: string) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const existingIds = new Set<string>(); 

  const lines = input.split('\n'); 

  lines.forEach((line, index) => { 
    const trimmedLine = line.trim();
    if (!trimmedLine) return; 

    const nodeRegex = /\[(.*?)\]/g; 
    const matches = [...trimmedLine.matchAll(nodeRegex)];

    matches.forEach((match, nodeIndex) => {
      if (match) {
        const label = match[1]; 
        const id = label.toLowerCase();

        if (existingIds.has(id)) return;
        existingIds.add(id);

        const newNode: Node = {
          id: id,
          type: 'system',
          position: {
            x: nodeIndex * 200,   
            y: index * 150       
          },
          data: { 
            label: label, 
            nodeType: label 
          }
        };

        nodes.push(newNode); 
      }
    })
  });

  return { nodes, edges }; 
};