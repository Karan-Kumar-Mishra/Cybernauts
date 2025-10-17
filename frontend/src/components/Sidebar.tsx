import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newHobby, setNewHobby] = useState('');

  // Helper function to safely get all hobbies
  const getAllHobbies = (): string[] => {
    try {
      const allHobbies = Array.from(
        new Set(state.users.flatMap(user => 
          Array.isArray(user.hobbies) ? user.hobbies : []
        ))
      ).filter(hobby => 
        typeof hobby === 'string' && 
        hobby.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return allHobbies;
    } catch (error) {
      console.error('Error getting hobbies:', error);
      return [];
    }
  };

  const allHobbies = getAllHobbies();

  const handleDragStart = (event: React.DragEvent, hobby: string) => {
    event.dataTransfer.setData('application/hobby', hobby);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddHobby = async () => {
    if (!newHobby.trim()) {
      toast.error('Please enter a hobby name');
      return;
    }

    try {
      // Add to global hobby list
      await apiService.addHobby(newHobby.trim());
      toast.success(`Hobby "${newHobby}" added successfully`);
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
        if (user) {
          // Ensure hobbies is an array
          const currentHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
          
          if (currentHobbies.includes(hobby)) {
            toast.error(`User already has hobby "${hobby}"`);
            return;
          }

          const updatedHobbies = [...currentHobbies, hobby];
          await apiService.updateUser(nodeId, { hobbies: updatedHobbies });
          toast.success(`Added "${hobby}" to ${user.username}`);
          
          // Refresh graph data to update popularity scores
          const graphData = await apiService.getGraphData();
          dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
          
          // Refresh users list
          const users = await apiService.getAllUsers();
          dispatch({ type: 'SET_USERS', payload: users });
        }
      } catch (error) {
        console.error('Error adding hobby to user:', error);
        toast.error('Failed to add hobby to user');
      }
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
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
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Hobby Manager</h3>
      
      {/* Add New Hobby */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Add New Hobby
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            placeholder="Enter hobby name"
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddHobby();
            }}
          />
          <button
            onClick={handleAddHobby}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search hobbies..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Hobby List */}
      <div>
        <h4 style={{ marginBottom: '12px', color: '#555' }}>
          Available Hobbies ({allHobbies.length})
        </h4>
        <div
          onDrop={onDragOver}
          onDragOver={onDragOver}
          style={{ minHeight: '200px' }}
        >
          {allHobbies.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              fontStyle: 'italic',
              padding: '20px'
            }}>
              No hobbies found
            </div>
          ) : (
            allHobbies.map(hobby => (
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
                  userSelect: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {hobby}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff',
        border: '1px dashed #007bff',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#0066cc'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>How to use:</p>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Drag hobbies onto user nodes</li>
          <li>Connect users by dragging between nodes</li>
          <li>Watch popularity scores update automatically</li>
        </ol>
      </div>
    </div>
  );
};