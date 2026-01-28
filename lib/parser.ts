import { Node, Edge } from 'reactflow';

export const parseCode = (input: string) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const existingIds = new Set<string>();

  const lines = input.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // --- THE LOGIC (Regex) ---
    const nodeRegex = /\[(.*?)\]/;
    const match = trimmedLine.match(nodeRegex);

    if (match) {
      const label = match[1];
      const id = label.toLowerCase();

      if (existingIds.has(id)) return;
      existingIds.add(id);

      const newNode: Node = {
        id: id,
        type: 'system',
        position: { x: 0, y: index * 100 },
        data: { 
          label: label, 
          nodeType: label // We pass the raw label; the Visual Component handles the icon logic
        }
      };

      nodes.push(newNode);
    }
  });

  return { nodes, edges };
};