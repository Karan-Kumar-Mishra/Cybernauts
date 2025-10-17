import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import { CreateUserRequest } from '../types';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    age: 25,
    hobbies: []
  });
  const [newHobby, setNewHobby] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (formData.age <= 0 || formData.age > 150) {
      toast.error('Age must be between 1 and 150');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newUser = await apiService.createUser(formData);
      
      // Refresh graph data
      const graphData = await apiService.getGraphData();
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
      
      // Refresh users list
      const users = await apiService.getAllUsers();
      dispatch({ type: 'SET_USERS', payload: users });
      
      toast.success(`User "${formData.username}" created successfully`);
      setIsCreating(false);
      setFormData({ username: '', age: 25, hobbies: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete "${username}"?`)) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      
      // Refresh graph data
      const graphData = await apiService.getGraphData();
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
      
      // Refresh users list
      const users = await apiService.getAllUsers();
      dispatch({ type: 'SET_USERS', payload: users });
      
      toast.success('User deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Cannot delete user with active relationships');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const addHobby = () => {
    const hobby = newHobby.trim();
    if (hobby && !formData.hobbies.includes(hobby)) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, hobby]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobbyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
    }));
  };

  // Helper function to safely format popularity score
  const formatPopularityScore = (score: any): string => {
    if (score === null || score === undefined) return '0.0';
    
    const numScore = typeof score === 'string' ? parseFloat(score) : Number(score);
    
    if (isNaN(numScore)) {
      console.warn('Invalid popularity score:', score);
      return '0.0';
    }
    
    return numScore.toFixed(1);
  };

  // Helper function to ensure hobbies is always an array
  const getHobbiesDisplay = (hobbies: any): string => {
    if (!hobbies) return 'None';
    if (Array.isArray(hobbies)) return hobbies.join(', ') || 'None';
    return 'None';
  };

  // Helper function to ensure friends is always an array
  const getFriendsCount = (friends: any): number => {
    if (!friends) return 0;
    if (Array.isArray(friends)) return friends.length;
    return 0;
  };

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderLeft: '1px solid #dee2e6',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>User Management</h3>

      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Create New User
        </button>
      ) : (
        <form onSubmit={handleCreateUser} style={{ 
          marginBottom: '20px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>Create New User</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Age *
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              min="1"
              max="150"
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Hobbies
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="Enter hobby"
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px' 
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHobby();
                  }
                }}
              />
              <button
                type="button"
                onClick={addHobby}
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
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {formData.hobbies.map(hobby => (
                <div
                  key={hobby}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    style={{ 
                      marginLeft: '4px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={state.loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: state.loading ? 'not-allowed' : 'pointer',
                opacity: state.loading ? 0.6 : 1
              }}
            >
              {state.loading ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <h4 style={{ marginBottom: '12px', color: '#555' }}>
          Existing Users ({state.users.length})
        </h4>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {state.users.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              fontStyle: 'italic',
              padding: '20px'
            }}>
              No users created yet
            </div>
          ) : (
            state.users.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.username}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Age: {user.age} | Popularity: {formatPopularityScore(user.popularityScore)}
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', color: '#888' }}>
                  Hobbies: {getHobbiesDisplay(user.hobbies)}
                </div>
                <div style={{ fontSize: '10px', marginTop: '2px', color: '#999' }}>
                  Friends: {getFriendsCount(user.friends)}
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete User
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};