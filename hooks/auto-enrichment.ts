import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function useAutoEnrichment() {
  const { nodes, updateNodeData } = useAppStore();
  
  
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nodesToEnrich = nodes.filter(node => {
      const hasColor = !!node.data.color;
      const alreadyProcessed = processedIds.current.has(node.id);
      return !hasColor && !alreadyProcessed;
    });

    if (nodesToEnrich.length === 0) return;

    nodesToEnrich.forEach(async (node) => {
      processedIds.current.add(node.id);

      try {
        const response = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: node.data.label }),
        });

        const data = await response.json();

        if (data.icon && data.color) {
          console.log("label", data.icon)
            updateNodeData(node.id, { 
                icon: data.icon, 
                color: data.color 
            });
        }
      } catch (error) {
        console.error(`Failed to enrich node ${node.id}:`, error);
      }
    });

  }, [nodes, updateNodeData]); 
}