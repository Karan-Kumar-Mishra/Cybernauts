import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider, // ✅ import this
} from 'reactflow';
import { Toaster } from 'react-hot-toast';
import { useApp } from './contexts/AppContext';
import { apiService } from './services/apiService';
import { CustomNode, HighScoreNode, LowScoreNode } from './components/CustomNode';
import { Sidebar } from './components/Sidebar';
import { UserManagement } from './components/UserManagement';
import 'reactflow/dist/style.css';

const nodeTypes = {
  default: CustomNode,
  highScore: HighScoreNode,
  lowScore: LowScoreNode,
};

function Flow() {
  const { state, dispatch } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  console.log("state=>",state)

  useEffect(() => {
    loadGraphData();
  }, [state.users.length]);

  const loadGraphData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [users, graphData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getGraphData(),
      ]);

      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });

      setNodes(graphData.nodes);
      setEdges(graphData.edges);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load graph data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = { ...params, type: 'smoothstep' };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
      );
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      dispatch({ type: 'SET_SELECTED_NODE', payload: node });
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const hobby = event.dataTransfer.getData('application/hobby');

      if (!type && !hobby) return;

      const position = project({
        x: event.clientX - 100,
        y: event.clientY - 50,
      });

      if (type === 'userNode') {
        const newNode = {
          id: `node-${Date.now()}`,
          type: 'default',
          position,
          data: { label: `New User ${Date.now()}` },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [project, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Toaster position="top-right" />
      <Sidebar />
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </div>
      <UserManagement />
    </div>
  );
}

export default App;
