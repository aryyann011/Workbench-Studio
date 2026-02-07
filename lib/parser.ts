import { Node, Edge } from 'reactflow';

export const parseCode = (input: string) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const existingIds = new Set<string>();
  const existingEdgesId = new Set<string>();

  const lines = input.split('\n'); 

  lines.forEach((line, index) => { 
    const trimmedLine = line.trim();
    if (!trimmedLine) return; 

    const nodeRegex = /\[(.*?)\]/g; 
    const nodeMatches = [...trimmedLine.matchAll(nodeRegex)];
    
    nodeMatches.forEach((match, nodeIndex) => {
      const label = match[1]; 
      const id = label.toLowerCase(); 

      if (!existingIds.has(id)) {
        existingIds.add(id);
        nodes.push({
          id: id,
          type: 'system', 
          position: { x: nodeIndex * 200, y: index * 150 },
          data: { label: label } 
        });
      }
    });

    if (trimmedLine.includes('->')) {
        const parts = trimmedLine.split('->').map(part => part.trim());

        for (let i = 0; i < parts.length - 1; i++) {
            const sourcePart = parts[i];    
            const targetPart = parts[i + 1]; 

            const sourceMatch = sourcePart.match(/\[(.*?)\]/);
            const targetMatch = targetPart.match(/\[(.*?)\]/);

            if (sourceMatch && targetMatch) {
                const sourceLabel = sourceMatch[1];
                const targetLabel = targetMatch[1];
                
                const sourceId = sourceLabel.toLowerCase();
                const targetId = targetLabel.toLowerCase();

                const edgeRepresentation = `${sourceId}->${targetId}`;
                const edgeId = edgeRepresentation.toLowerCase()

                if (!existingEdgesId.has(edgeId)) {
                    existingEdgesId.add(edgeId);
                    edges.push({
                        id: edgeId,
                        source: sourceId,
                        target: targetId,
                        type: 'default',
                        animated: true,
                    });
                }
            }
        }
    }
  });

  return { nodes, edges }; 
};