import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newHobby, setNewHobby] = useState('');

  const allHobbies = Array.from(
    new Set(state.users.flatMap(user => user.hobbies))
  ).filter(hobby => 
    hobby.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (event: React.DragEvent, hobby: string) => {
    event.dataTransfer.setData('application/hobby', hobby);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddHobby = async () => {
    if (!newHobby.trim()) return;

    try {
      // In a real app, this would add to a global hobby list
      toast.success(`Hobby "${newHobby}" added to available hobbies`);
      setNewHobby('');
    } catch (error) {
      toast.error('Failed to add hobby');
    }
  };

  const handleNodeDrop = async (event: React.DragEvent, nodeId: string) => {
    event.preventDefault();
    const hobby = event.dataTransfer.getData('application/hobby');
    
    if (hobby) {
      try {
        const user = state.users.find(u => u.id === nodeId);
        if (user && !user.hobbies.includes(hobby)) {
          const updatedHobbies = [...user.hobbies, hobby];
          await apiService.updateUser(nodeId, { hobbies: updatedHobbies });
          toast.success(`Added "${hobby}" to ${user.username}`);
          
          // Refresh graph data
          const graphData = await apiService.getGraphData();
          dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
        }
      } catch (error) {
        toast.error('Failed to add hobby to user');
      }
    }
  };

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRight: '1px solid #dee2e6',
      overflowY: 'auto'
    }}>
      <h3>Hobby Manager</h3>
      
      {/* Add New Hobby */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Enter new hobby"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={handleAddHobby}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Hobby
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search hobbies..."
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />

      {/* Hobby List */}
      <div>
        <h4>Available Hobbies</h4>
        <div
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          style={{ minHeight: '200px' }}
        >
          {allHobbies.map(hobby => (
            <div
              key={hobby}
              draggable
              onDragStart={(e) => handleDragStart(e, hobby)}
              style={{
                padding: '8px 12px',
                margin: '4px 0',
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'grab',
                userSelect: 'none'
              }}
            >
              {hobby}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zone for Nodes */}
      <div style={{ marginTop: '20px', padding: '10px', border: '2px dashed #ccc', borderRadius: '4px' }}>
        <p style={{ textAlign: 'center', margin: 0 }}>
          Drag hobbies onto user nodes in the graph
        </p>
      </div>
    </div>
  );
};