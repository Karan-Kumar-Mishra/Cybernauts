import useUserMangement from "../hooks/ComponentsHooks/useUserMangement";


export const UserManagement: React.FC = () => {
  const { state, isCreating, setIsCreating, handleCreateUser, handleDeleteUser,newHobby,
    addHobby, removeHobby, formatPopularityScore, getHobbiesDisplay, getFriendsCount,formData,setFormData } = useUserMangement();

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