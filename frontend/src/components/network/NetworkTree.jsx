import { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const NetworkTree = ({ networkData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const transformNetworkToGraph = useCallback((data) => {
    if (!data || !data.id) {
      console.log('Invalid network data:', data);
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // Process nodes level by level
    const processLevel = (levelNodes, level) => {
      if (!levelNodes || levelNodes.length === 0) return;

      // Calculate spacing based on the maximum possible nodes at this level (3^level)
      const maxNodesAtLevel = Math.pow(3, level);
      const xSpacing = 150; // Reduced spacing to accommodate more nodes
      const levelWidth = maxNodesAtLevel * xSpacing;
      const startX = -levelWidth / 2;

      levelNodes.forEach((node, index) => {
        if (!node || !node.id) {
          console.log('Invalid node at level', level, ':', node);
          return;
        }

        // Calculate x position to center nodes within their parent's space
        const xPos = startX + (index * (levelWidth / (levelNodes.length || 1)));
        const yPos = level * 100;

        nodes.push({
          id: node.id.toString(),
          position: { x: xPos, y: yPos },
          data: {
            label: (
              <div className={`rounded-lg shadow p-2 border ${
                node.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-semibold text-sm">
                  {node.user?.firstName || 'Unknown'} {node.user?.lastName || ''}
                </div>
                <div className="text-xs text-gray-500">Level {level}</div>
                <div className="text-xs text-gray-400">Position {node.position || 'N/A'}</div>
              </div>
            )
          },
          type: 'default',
        });

        // Add edges to parent if exists
        if (node.sponsorId) {
          edges.push({
            id: `${node.sponsorId}-${node.id}`,
            source: node.sponsorId.toString(),
            target: node.id.toString(),
            type: 'smoothstep',
            style: { stroke: '#2563eb', strokeWidth: 2 },
          });
        }
      });
    };

    // Add root node (current user)
    nodes.push({
      id: data.id.toString(),
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div className="bg-blue-50 rounded-lg shadow p-2 border border-blue-200">
            <div className="font-semibold text-sm">{data.user?.firstName || 'You'} {data.user?.lastName || ''}</div>
            <div className="text-xs text-blue-500">You</div>
          </div>
        )
      },
      type: 'default',
    });

    // Process each level
    if (data.children) {
      Object.entries(data.children).forEach(([level, nodes]) => {
        if (Array.isArray(nodes)) {
          processLevel(nodes, parseInt(level));
        } else {
          console.log('Invalid nodes at level', level, ':', nodes);
        }
      });
    }

    return { nodes, edges };
  }, []);

  useEffect(() => {
    if (networkData) {
      console.log('Processing network data:', networkData);
      const { nodes: newNodes, edges: newEdges } = transformNetworkToGraph(networkData);
      console.log('Setting new nodes and edges:', { nodes: newNodes, edges: newEdges });
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [networkData, transformNetworkToGraph, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full bg-gray-50 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default NetworkTree;
