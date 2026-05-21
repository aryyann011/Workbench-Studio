import { Node, Edge, NodeResizeControl, MarkerType } from 'reactflow';

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
                        animated: false,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: '#94a3b8',
                        },
                        style: {
                            strokeWidth: 2.5,
                            stroke: '#94a3b8',
                        },
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
            parentNode.zIndex = 0;
            parentNode.draggable = true;
            // dragHandle restricts group dragging to only the label element
            parentNode.dragHandle = '.group-drag-handle';
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
            // Higher zIndex so child is always on top of parent for hit detection
            childNode.zIndex = 10;
          }
        }
      }
    }
  });

  // ReactFlow requires parent nodes to appear BEFORE their children in the array.
  // Sort: group nodes first, then child nodes, then standalone nodes maintain order.
  const parentIds = new Set(nodes.filter(n => n.type === 'group').map(n => n.id));
  const sortedNodes = [
    ...nodes.filter(n => n.type === 'group'),
    ...nodes.filter(n => n.parentNode && parentIds.has(n.parentNode)),
    ...nodes.filter(n => n.type !== 'group' && !n.parentNode),
  ];

  return { nodes: sortedNodes, edges }; 
};