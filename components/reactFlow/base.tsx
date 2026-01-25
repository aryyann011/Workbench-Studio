"use client";

import { ReactFlow, Background, Controls, Connection, Panel } from '@xyflow/react';
import { useState, useCallback } from 'react';
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange, BackgroundVariant
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'n1',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    type: 'input',
  },
  {
    id: 'n2',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'n1-n2',
    source: 'n1',
    target: 'n2',
    label: 'connects with',
  },
];

export default function BaseEditor() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [variant, setVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) =>
        applyNodeChanges(changes, nodesSnapshot)
      ),
    []
  );

  const onConnect = useCallback(
    (params : Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) =>
        applyEdgeChanges(changes, edgesSnapshot)
      ),
    []
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="skyblue" variant={variant} />
        <Panel className='border'>
          <div>variant:</div>
          <button className="border-1" onClick={() => setVariant(BackgroundVariant.Dots)}>dots</button>
          <button onClick={() => setVariant(BackgroundVariant.Lines)}>lines</button>
          <button onClick={() => setVariant(BackgroundVariant.Cross)}>cross</button>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
}
