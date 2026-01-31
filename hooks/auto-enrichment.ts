import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function useAutoEnrichment() {
  const { nodes, updateNodeData } = useAppStore();
  
  // We use a Ref to track which IDs we have already processed
  // This prevents infinite loops of asking the API for the same node
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Find "Stale" Nodes
    // Condition: Node exists, but has NO color data, and we haven't asked about it yet.
    const nodesToEnrich = nodes.filter(node => {
      const hasColor = !!node.data.color;
      const alreadyProcessed = processedIds.current.has(node.id);
      return !hasColor && !alreadyProcessed;
    });

    if (nodesToEnrich.length === 0) return;

    // 2. Process each node
    nodesToEnrich.forEach(async (node) => {
      // Mark as processed immediately so we don't try again in the next render
      processedIds.current.add(node.id);

      try {
        // 3. Call the API
        const response = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: node.data.label }),
        });

        const data = await response.json();

        // 4. Update the Store
        if (data.icon && data.color) {
            updateNodeData(node.id, { 
                icon: data.icon, 
                color: data.color 
            });
        }
      } catch (error) {
        console.error(`Failed to enrich node ${node.id}:`, error);
        // Optional: Remove from processedIds if you want to retry later
      }
    });

  }, [nodes, updateNodeData]); // Re-run whenever nodes change
}