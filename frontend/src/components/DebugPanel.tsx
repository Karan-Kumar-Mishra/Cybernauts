import React from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

export const DebugPanel: React.FC = () => {
  const { state } = useApp();
  
  const testRelationshipCreation = async () => {
    try {
      // Get user IDs first
      const response = await fetch('http://localhost:5000/api/test/user-ids');
      const users = await response.json();
      
      if (users.length < 2) {
        alert('Need at least 2 users to test');
        return;
      }

      const user1 = users[0].id;
      const user2 = users[1].id;
      
      console.log(`🧪 Testing relationship between ${user1} and ${user2}`);
      
      const result = await fetch('http://localhost:5000/api/test/relationship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: user1,
          userId2: user2
        })
      });

      const data = await result.json();
      console.log('Test result:', data);
      
      if (data.success) {
        alert('✅ Relationship created successfully! Check backend logs and database.');
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      alert(`❌ Test error: ${error.message}`);
    }
  };

  const checkDatabaseState = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/debug/database');
      const data = await response.json();
      console.log('📊 Database State:', data);
      alert(`Database State:\nUsers: ${data.database.users.count}\nRelationships: ${data.database.relationships.count}`);
    } catch (error) {
      console.error('Error checking database state:', error);
    }
  };

  const refreshData = async () => {
    try {
      const [graphData, users] = await Promise.all([
        apiService.getGraphData(),
        apiService.getAllUsers()
      ]);
      
      console.log('🔄 Manual refresh:', {
        nodes: graphData.nodes.length,
        edges: graphData.edges.length,
        users: users.length
      });
      
      alert(`Refreshed!\nNodes: ${graphData.nodes.length}\nEdges: ${graphData.edges.length}\nUsers: ${users.length}`);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const removeAllEdges = async () => {
    if (state.edges.length === 0) {
      alert('No edges to remove');
      return;
    }

    if (window.confirm(`Remove all ${state.edges.length} connections?`)) {
      try {
        toast.loading('Removing all connections...', { id: 'remove-all' });
        
        // Remove each edge
        for (const edge of state.edges) {
          await apiService.removeRelationship(edge.source, edge.target);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
        }
        
        // Refresh data
        await refreshData();
        
        toast.success('All connections removed!', { id: 'remove-all' });
      } catch (error) {
        console.error('Failed to remove all edges:', error);
        toast.error('Failed to remove all connections', { id: 'remove-all' });
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '350px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🧪 Debug Panel</div>
      
      <div style={{ marginBottom: '5px' }}>Users: {state.users.length}</div>
      <div style={{ marginBottom: '5px' }}>Nodes: {state.nodes.length}</div>
      <div style={{ marginBottom: '10px' }}>Edges: {state.edges.length}</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button 
          onClick={testRelationshipCreation}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Create Relationship
        </button>
        
        <button 
          onClick={checkDatabaseState}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Check Database
        </button>
        
        <button 
          onClick={refreshData}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
        
        {state.edges.length > 0 && (
          <button 
            onClick={removeAllEdges}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Remove All Edges
          </button>
        )}
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
        Edge Controls:
        <div>• Double-click to remove</div>
        <div>• Right-click for menu</div>
        <div>• Shift+click to remove</div>
      </div>
    </div>
  );
};