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
import CustomEdge from './CustomEdge';

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
        await new Promise(resolve => setTimeout(resolve, 1000));

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

  // Remove edge/connection functionality
  const removeEdge = async (edge: Edge) => {
    console.log('🗑️ Removing edge:', edge);

    const sourceUser = state.users.find(u => u.id === edge.source);
    const targetUser = state.users.find(u => u.id === edge.target);

    if (!sourceUser || !targetUser) {
      console.error('❌ Could not find users for edge removal');
      toast.error('Cannot remove connection - users not found');
      return;
    }

    if (window.confirm(`Remove connection between ${sourceUser.username} and ${targetUser.username}?`)) {
      try {
        toast.loading('Removing connection...', { id: 'remove-connection' });

        console.log(`📞 Calling API to remove relationship: ${edge.source} ↔ ${edge.target}`);
        await apiService.removeRelationship(edge.source, edge.target);

        console.log('✅ Relationship removed from backend');

        // Wait for backend processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refresh data from backend
        console.log('🔄 Refreshing data after removal...');
        const [graphData, users] = await Promise.all([
          apiService.getGraphData(),
          apiService.getAllUsers()
        ]);

        // Update global state
        dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
        dispatch({ type: 'SET_USERS', payload: users });

        // Update local React Flow state
        setNodes(graphData.nodes);
        setEdges(graphData.edges);

        toast.success(`Connection removed between ${sourceUser.username} and ${targetUser.username}!`, {
          id: 'remove-connection',
          duration: 4000
        });

        console.log('✅ Edge removal completed successfully');

      } catch (error: any) {
        console.error('❌ Failed to remove relationship:', error);
        toast.error('Failed to remove connection', { id: 'remove-connection' });
      }
    }
  };

  // Edge double-click handler
  const onEdgeDoubleClick = useCallback(
    async (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      await removeEdge(edge);
    },
    [state.users, dispatch, setNodes, setEdges]
  );

  // Edge click handler (with delete key)
  const onEdgeClick = useCallback(
    async (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      console.log('🖱️ Edge clicked:', edge);

      // If shift key is pressed, remove immediately
      if (event.shiftKey) {
        await removeEdge(edge);
      }
    },
    [state.users, dispatch, setNodes, setEdges]
  );

  // Context menu for edges
  const onEdgeContextMenu = useCallback(
    async (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();

      const sourceUser = state.users.find(u => u.id === edge.source);
      const targetUser = state.users.find(u => u.id === edge.target);

      if (sourceUser && targetUser) {
        const remove = window.confirm(
          `Remove connection between ${sourceUser.username} and ${targetUser.username}?`
        );

        if (remove) {
          await removeEdge(edge);
        }
      }
    },
    [state.users, dispatch, setNodes, setEdges]
  );

  // Add this useEffect to listen for custom edge delete events
  useEffect(() => {
    const handleEdgeDelete = async (event: CustomEvent) => {
      const { edgeId } = event.detail;
      console.log('🗑️ Edge delete event received:', edgeId);

      // Find the edge to delete
      const edgeToDelete = edges.find(edge => edge.id === edgeId);
      if (edgeToDelete) {
        await removeEdge(edgeToDelete);
      }
    };

    window.addEventListener('edgeDelete', handleEdgeDelete as EventListener);

    return () => {
      window.removeEventListener('edgeDelete', handleEdgeDelete as EventListener);
    };
  }, [edges, state.users, dispatch, setNodes, setEdges]);

  // Key press handler for delete key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && state.selectedNode) {
        // You can add node deletion logic here if needed
        console.log('Delete key pressed with selected node:', state.selectedNode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [state.selectedNode]);

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

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    // Deselect node when clicking on empty space
    dispatch({ type: 'SET_SELECTED_NODE', payload: null });
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

  const edgeTypes = {
    custom: CustomEdge,
  };

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
        border: '2px solid #007bff',
        maxWidth: '300px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#007bff' }}>
          🔗 Connection Controls:
        </div>
        <div>• Drag handles to connect users</div>
        <div>• <strong>Double-click</strong> edge to remove</div>
        <div>• <strong>Right-click</strong> edge for menu</div>
        <div>• <strong>Shift+Click</strong> edge to remove</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
          Watch browser console for events
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          type: 'custom',
        }))}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        connectionLineStyle={{ stroke: '#ff0066', strokeWidth: 3 }}
        connectionLineType="smoothstep"
        deleteKeyCode={['Delete', 'Backspace']}
        edgesFocusable={true}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Flow;