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
    age: 0,
    hobbies: []
  });
  const [newHobby, setNewHobby] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || formData.age <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newUser = await apiService.createUser(formData);
      
      // Refresh graph data
      const graphData = await apiService.getGraphData();
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
      
      toast.success('User created successfully');
      setIsCreating(false);
      setFormData({ username: '', age: 0, hobbies: [] });
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      
      // Refresh graph data
      const graphData = await apiService.getGraphData();
      dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
      
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
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
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

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderLeft: '1px solid #dee2e6',
      overflowY: 'auto'
    }}>
      <h3>User Management</h3>

      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Create New User
        </button>
      ) : (
        <form onSubmit={handleCreateUser} style={{ marginBottom: '20px' }}>
          <h4>Create User</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Age *</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              min="0"
              max="150"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Hobbies</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="Add hobby"
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={addHobby}
                style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Add
              </button>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              {formData.hobbies.map(hobby => (
                <div
                  key={hobby}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#e9ecef',
                    padding: '4px 8px',
                    margin: '2px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
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
                cursor: 'pointer'
              }}
            >
              Create
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
        <h4>Existing Users ({state.users.length})</h4>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {state.users.map(user => (
            <div
              key={user.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{user.username}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Age: {user.age} | Popularity: {user.popularityScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Hobbies: {user.hobbies.join(', ') || 'None'}
              </div>
              <button
                onClick={() => handleDeleteUser(user.id, user.username)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};