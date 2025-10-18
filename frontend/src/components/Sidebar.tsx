import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [availableHobbies, setAvailableHobbies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedHobby, setDraggedHobby] = useState<string | null>(null);

  // Load available hobbies from backend
  const loadAvailableHobbies = async () => {
    try {
      const hobbies = await apiService.getAllHobbies();
      setAvailableHobbies(hobbies);
    } catch (error) {
      console.error('Error loading hobbies:', error);
      // If backend fails, fall back to extracting from users
      const hobbiesFromUsers = Array.from(
        new Set(state.users.flatMap(user => 
          Array.isArray(user.hobbies) ? user.hobbies : []
        ))
      );
      setAvailableHobbies(hobbiesFromUsers);
    }
  };

  // Load hobbies when component mounts or users change
  useEffect(() => {
    loadAvailableHobbies();
  }, [state.users]);

  // Filter hobbies based on search term
  const filteredHobbies = availableHobbies.filter(hobby => 
    hobby.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (event: React.DragEvent, hobby: string) => {
    console.log('🟢 Drag started for hobby:', hobby);
    
    // Set both text/plain and application/hobby data
    event.dataTransfer.setData('text/plain', hobby);
    event.dataTransfer.setData('application/hobby', hobby);
    event.dataTransfer.effectAllowed = 'copy';
    
    setDraggedHobby(hobby);
    
    // Add visual feedback
    const element = event.currentTarget as HTMLElement;
    element.style.opacity = '0.4';
    element.style.backgroundColor = '#e3f2fd';
  };

  const handleDragEnd = (event: React.DragEvent) => {
    console.log('🔴 Drag ended');
    
    const element = event.currentTarget as HTMLElement;
    element.style.opacity = '1';
    element.style.backgroundColor = 'white';
    
    setDraggedHobby(null);
  };

  const handleAddHobby = async () => {
    const hobbyName = newHobby.trim();
    
    if (!hobbyName) {
      toast.error('Please enter a hobby name');
      return;
    }

    if (hobbyName.length < 2) {
      toast.error('Hobby name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Add to backend first
      await apiService.addHobby(hobbyName);
      
      // Update local state
      setAvailableHobbies(prev => {
        const newHobbies = [...prev, hobbyName];
        return Array.from(new Set(newHobbies)).sort();
      });
      
      setNewHobby('');
      toast.success(`Hobby "${hobbyName}" added successfully!`);
      
      // Refresh the hobbies list from backend to ensure consistency
      setTimeout(() => {
        loadAvailableHobbies();
      }, 100);
      
    } catch (error: any) {
      console.error('Error adding hobby:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Failed to add hobby');
      } else if (error.code === 'ECONNREFUSED') {
        // If backend is not available, add to local state only
        setAvailableHobbies(prev => {
          const newHobbies = [...prev, hobbyName];
          return Array.from(new Set(newHobbies)).sort();
        });
        setNewHobby('');
        toast.success(`Hobby "${hobbyName}" added locally (backend unavailable)`);
      } else {
        toast.error('Failed to add hobby. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveHobby = async (hobby: string) => {
    if (!window.confirm(`Are you sure you want to remove the hobby "${hobby}"?`)) {
      return;
    }

    try {
      await apiService.removeHobby(hobby);
      
      // Update local state
      setAvailableHobbies(prev => prev.filter(h => h !== hobby));
      toast.success(`Hobby "${hobby}" removed successfully`);
      
      // Refresh the list
      setTimeout(() => {
        loadAvailableHobbies();
      }, 100);
      
    } catch (error: any) {
      console.error('Error removing hobby:', error);
      toast.error('Failed to remove hobby. Please try again.');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    console.log('Hobby dropped in sidebar area');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddHobby();
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
            onKeyPress={handleKeyPress}
            placeholder="Enter hobby name"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              opacity: isLoading ? 0.6 : 1
            }}
          />
          <button
            onClick={handleAddHobby}
            disabled={isLoading || !newHobby.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '...' : 'Add'}
          </button>
        </div>
        {newHobby.trim() && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            Press Enter or click Add to add "{newHobby.trim()}"
          </div>
        )}
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px' 
        }}>
          <h4 style={{ margin: 0, color: '#555' }}>
            Available Hobbies ({filteredHobbies.length})
          </h4>
          <button
            onClick={loadAvailableHobbies}
            style={{
              padding: '4px 8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ 
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '2px dashed transparent',
            borderRadius: '8px',
            padding: '8px'
          }}
        >
          {filteredHobbies.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              fontStyle: 'italic',
              padding: '20px'
            }}>
              {searchTerm ? 'No hobbies match your search' : 'No hobbies available. Add some above!'}
            </div>
          ) : (
            filteredHobbies.map(hobby => (
              <div
                key={hobby}
                draggable
                onDragStart={(e) => handleDragStart(e, hobby)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: '12px 16px',
                  margin: '8px 0',
                  backgroundColor: 'white',
                  border: draggedHobby === hobby ? '2px solid #007bff' : '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: draggedHobby === hobby 
                    ? '0 4px 12px rgba(0, 123, 255, 0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: draggedHobby === hobby ? 'scale(0.95)' : 'scale(1)'
                }}
                onMouseOver={(e) => {
                  if (draggedHobby !== hobby) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#007bff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (draggedHobby !== hobby) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#2d3748',
                    fontSize: '14px'
                  }}>
                    {hobby}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#718096',
                      cursor: 'grab'
                    }}>
                      ⋮⋮
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHobby(hobby);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={`Remove ${hobby}`}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8d7da';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drag Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: draggedHobby ? '#e7f6e9' : '#e7f3ff',
        border: draggedHobby ? '2px solid #28a745' : '1px dashed #007bff',
        borderRadius: '8px',
        fontSize: '14px',
        color: draggedHobby ? '#2e7d32' : '#0066cc',
        textAlign: 'center'
      }}>
        {draggedHobby ? (
          <>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Dragging: "{draggedHobby}"
            </div>
            <div>Drop it on any user node in the graph</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>💡</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              How to use drag & drop:
            </div>
            <div>Drag hobbies onto user nodes to add them</div>
          </>
        )}
      </div>
    </div>
  );
};