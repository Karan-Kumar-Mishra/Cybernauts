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
} from 'reactflow';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import { CustomNode, HighScoreNode, LowScoreNode } from './CustomNode';
import toast from 'react-hot-toast';
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

  // Load graph data
  const loadGraphData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const graphData = await apiService.getGraphData();
      
      console.log('📥 Loaded graph data from backend:', {
        nodes: graphData.nodes.length,
        edges: graphData.edges.length
      });
      
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
      
    } catch (error) {
      console.error('Error loading graph data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load graph data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const users = await apiService.getAllUsers();
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadGraphData(), loadUsers()]);
    };
    
    initializeData();
  }, []);

  // Sync local React Flow state with global state
  useEffect(() => {
    if (state.nodes.length > 0) {
      console.log('🔄 Syncing React Flow state with global state');
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [state.nodes, state.edges, setNodes, setEdges]);

  // FIXED: This is the main connection handler that should be called
  const onConnect = useCallback(
    async (params: Connection) => {
      console.log('🎯 === REACT FLOW MAIN ONCONNECT HANDLER TRIGGERED ===');
      console.log('🔗 Full connection details:', JSON.stringify(params, null, 2));
      
      if (!params.source || !params.target) {
        console.error('❌ Missing source or target for connection');
        toast.error('Cannot create connection - missing nodes');
        return;
      }

      if (params.source === params.target) {
        console.error('❌ Cannot connect node to itself');
        toast.error('Cannot connect a user to themselves');
        return;
      }

      // Find the actual users for these node IDs
      const sourceUser = state.users.find(u => u.id === params.source);
      const targetUser = state.users.find(u => u.id === params.target);
      
      console.log('👥 Users found:', {
        source: sourceUser ? `${sourceUser.username} (${params.source})` : 'Not found',
        target: targetUser ? `${targetUser.username} (${params.target})` : 'Not found'
      });

      if (!sourceUser || !targetUser) {
        console.error('❌ Could not find users for connection');
        toast.error('Cannot create connection - users not found');
        return;
      }

      try {
        // Show loading
        toast.loading(`Connecting ${sourceUser.username} and ${targetUser.username}...`, { 
          id: 'create-connection' 
        });

        console.log(`📞 Calling API to create relationship: ${params.source} → ${params.target}`);
        
        // Create relationship in backend
        await apiService.createRelationship(params.source, params.target);
        
        console.log('✅ Backend relationship created successfully');
        
        // Wait a moment for backend processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh ALL data from backend
        console.log('🔄 Refreshing graph data and users...');
        const [graphData, users] = await Promise.all([
          apiService.getGraphData(),
          apiService.getAllUsers()
        ]);
        
        console.log('📥 Refreshed data:', {
          nodes: graphData.nodes.length,
          edges: graphData.edges.length,
          users: users.length
        });
        
        // Update global state
        dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
        dispatch({ type: 'SET_USERS', payload: users });
        
        toast.success(`Connected ${sourceUser.username} and ${targetUser.username}! 🎉`, { 
          id: 'create-connection',
          duration: 4000 
        });
        
        console.log('✅ Connection completed successfully');
        
      } catch (error: any) {
        console.error('❌ Failed to create relationship:', error);
        
        if (error.response?.status === 409) {
          toast.error('Users are already connected!', { id: 'create-connection' });
        } else if (error.response?.status === 404) {
          toast.error('One or both users not found', { id: 'create-connection' });
        } else {
          const errorMessage = error.response?.data?.error || error.message || 'Failed to create connection';
          toast.error(errorMessage, { 
            id: 'create-connection' 
          });
        }
      }
    },
    [state.users, dispatch]
  );

  // Add a temporary connection for testing
  const onConnectStart = useCallback((event: any, params: any) => {
    console.log('🔵 Connection start:', params);
  }, []);

  const onConnectEnd = useCallback((event: any) => {
    console.log('🔴 Connection end:', event);
  }, []);

  const onNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, position: node.position }
          : n
      )
    );
  }, [setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    dispatch({ type: 'SET_SELECTED_NODE', payload: node });
    console.log('Selected node:', node.data.username);
  }, [dispatch]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('Item dropped on canvas background');
    },
    [project, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Add edge double-click handler to remove connections
  const onEdgeDoubleClick = useCallback(
    async (event: React.MouseEvent, edge: Edge) => {
      if (window.confirm('Remove this connection?')) {
        try {
          toast.loading('Removing connection...', { id: 'remove-connection' });
          
          await apiService.removeRelationship(edge.source, edge.target);
          
          await loadGraphData();
          await loadUsers();
          
          toast.success('Connection removed!', { id: 'remove-connection' });
        } catch (error: any) {
          console.error('Failed to remove relationship:', error);
          toast.error('Failed to remove connection', { id: 'remove-connection' });
        }
      }
    },
    [loadGraphData, loadUsers]
  );

  if (state.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading graph data...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Connection Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '2px solid #007bff'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#007bff' }}>
          🔗 How to Connect Users:
        </div>
        <div>1. Click and drag from <strong style={{color: '#007bff'}}>BLUE</strong> handle (bottom)</div>
        <div>2. Drop on <strong style={{color: '#28a745'}}>GREEN</strong> handle (top) of another user</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
          Watch browser console for connection events
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        connectionLineStyle={{ stroke: '#ff0066', strokeWidth: 3 }}
        connectionLineType="smoothstep"
        deleteKeyCode={['Delete', 'Backspace']}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Flow;