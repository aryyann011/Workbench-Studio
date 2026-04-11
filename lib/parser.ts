import { Node, Edge, NodeResizeControl } from 'reactflow';

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
                        type: 'smoothstep',
                        animated: true,
                    });
                }
            }
        }
    }
    
    else if (trimmedLine.includes('inside')) {
      const parts = trimmedLine.split('inside').map(part => part.trim());

      if (parts.length === 2) {
        const childMatch = parts[0].match(/\[(.*?)\]/);
        const parentMatch = parts[1].match(/\[(.*?)\]/);

        if (childMatch && parentMatch) {
          const childId = childMatch[1].toLowerCase();
          const parentId = parentMatch[1].toLowerCase();

          const parentNode = nodes.find(node => node.id === parentId);
          if (parentNode) {
            parentNode.type = 'group';
            parentNode.style = { 
              backgroundColor: 'rgba(241, 245, 249, 0.05)', 
              border: '2px dashed #64748b', 
              width: 400, 
              height: 400 
            };
          }

          const childNode = nodes.find(node => node.id === childId);
          if (childNode) {
            childNode.parentNode = parentId;
            childNode.extent = 'parent';
          }
        }
      }
    }
  });

  return { nodes, edges }; 
};