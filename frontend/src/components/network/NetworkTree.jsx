import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles
const nodeStyles = {
  ACTIVE: {
    wrapper: 'bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-3 border-2 border-green-200 hover:shadow-xl transition-all duration-300',
    title: 'font-semibold text-sm text-green-800',
    subtitle: 'text-xs text-green-600',
    stats: 'mt-2 grid grid-cols-2 gap-2 text-xs',
    stat: 'bg-white/50 rounded p-1 text-center',
  },
  INACTIVE: {
    wrapper: 'bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg shadow p-3 border-2 border-gray-200',
    title: 'font-semibold text-sm text-gray-800',
    subtitle: 'text-xs text-gray-600',
    stats: 'mt-2 grid grid-cols-2 gap-2 text-xs',
    stat: 'bg-white/50 rounded p-1 text-center',
  },
  ROOT: {
    wrapper: 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-3 border-2 border-blue-200 hover:shadow-xl transition-all duration-300',
    title: 'font-semibold text-sm text-blue-800',
    subtitle: 'text-xs text-blue-600',
    stats: 'mt-2 grid grid-cols-2 gap-2 text-xs',
    stat: 'bg-white/50 rounded p-1 text-center',
  }
};

const NetworkTree = ({ networkData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layout, setLayout] = useState('vertical'); // vertical or horizontal

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

      const maxNodesAtLevel = Math.pow(3, level);
      const spacing = layout === 'vertical' ? 
        { x: 200, y: 120 } : 
        { x: 120, y: 200 };
      
      const levelWidth = maxNodesAtLevel * spacing.x;
      const startX = -levelWidth / 2;

      levelNodes.forEach((node, index) => {
        if (!node || !node.id) {
          console.log('Invalid node at level', level, ':', node);
          return;
        }

        // Calculate positions based on layout
        const xPos = layout === 'vertical' ?
          startX + (index * (levelWidth / (levelNodes.length || 1))) :
          level * spacing.x;
        
        const yPos = layout === 'vertical' ?
          level * spacing.y :
          startX + (index * (levelWidth / (levelNodes.length || 1)));

        const styles = node.status === 'ACTIVE' ? nodeStyles.ACTIVE : nodeStyles.INACTIVE;

        nodes.push({
          id: node.id.toString(),
          position: { x: xPos, y: yPos },
          data: {
            label: (
              <div className={styles.wrapper}>
                <div className={styles.title}>
                  {node.user?.firstName || 'Unknown'} {node.user?.lastName || ''}
                </div>
                <div className={styles.subtitle}>Level {level} • {node.position || 'N/A'}</div>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    {/* <div className="font-medium">{node.sponsored?.length || 0}</div>
                    <div className="text-gray-500">Direct</div> */}
                  </div>
                  <div className={styles.stat}>
                    {/* <div className="font-medium">{node.package?.name || 'No Package'}</div>
                    <div className="text-gray-500">Package</div> */}
                  </div>
                </div>
              </div>
            ),
            nodeData: node
          },
          type: 'default',
        });

        // Add edges with custom styling
        if (node.sponsorId) {
          edges.push({
            id: `${node.sponsorId}-${node.id}`,
            source: node.sponsorId.toString(),
            target: node.id.toString(),
            type: 'smoothstep',
            animated: node.status === 'ACTIVE',
            style: { 
              stroke: node.status === 'ACTIVE' ? '#10b981' : '#94a3b8',
              strokeWidth: 2,
            },
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
          <div className={nodeStyles.ROOT.wrapper}>
            <div className={nodeStyles.ROOT.title}>
              {data.user?.firstName || 'You'} {data.user?.lastName || ''}
            </div>
            <div className={nodeStyles.ROOT.subtitle}>Network Owner</div>
            <div className={nodeStyles.ROOT.stats}>
              <div className={nodeStyles.ROOT.stat}>
                <div className="font-medium">{data.sponsored?.length || 0}</div>
                <div className="text-gray-500">Direct</div>
              </div>
              <div className={nodeStyles.ROOT.stat}>
                <div className="font-medium">{data.package?.package?.name || 'No Package'}</div>
                <div className="text-gray-500">Package</div>
              </div>
            </div>
          </div>
        ),
        nodeData: data
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
  }, [layout]);

  useEffect(() => {
    const { nodes, edges } = transformNetworkToGraph(networkData);
    setNodes(nodes);
    setEdges(edges);
  }, [networkData, transformNetworkToGraph]);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node.data.nodeData);
  };

  const toggleLayout = () => {
    setLayout(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          style={{
            height: 120,
            backgroundColor: 'rgb(255, 255, 255, 0.8)'
          }}
          zoomable
          pannable
        />
        <Background color="#ddd" gap={16} />
        
        <Panel position="top-right" className="space-y-2">
          <button
            onClick={toggleLayout}
            className="px-3 py-2 bg-white rounded-md shadow text-sm font-medium hover:bg-gray-50"
          >
            {layout === 'vertical' ? '↕️ Vertical' : '↔️ Horizontal'}
          </button>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-center" className="bg-white p-4 rounded-t-lg shadow-lg">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="font-semibold">
                  {selectedNode.user?.firstName} {selectedNode.user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  Level {selectedNode.level} • Position {selectedNode.position}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Package</div>
                <div className="font-medium">{selectedNode.package?.package?.name || 'No Package'}</div>
              </div>
              <div>
                <div className="text-gray-500">Direct Referrals</div>
                <div className="font-medium">{selectedNode.sponsored?.length || 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">{selectedNode.status}</div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default NetworkTree;