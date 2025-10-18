import React from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';

export const DebugPanel: React.FC = () => {
  const { state } = useApp();
  
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

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Debug Info</div>
      <div>Users: {state.users.length}</div>
      <div>Nodes: {state.nodes.length}</div>
      <div>Edges: {state.edges.length}</div>
      <button 
        onClick={checkDatabaseState}
        style={{
          marginTop: '5px',
          padding: '2px 6px',
          fontSize: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Check DB
      </button>
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        Edges: {state.edges.map(edge => `${edge.source}→${edge.target}`).join(', ') || 'None'}
      </div>
    </div>
  );
};