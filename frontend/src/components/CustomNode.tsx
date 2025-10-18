import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

interface CustomNodeData {
  label: string;
  username: string;
  age: number;
  popularityScore: number;
  hobbies: string[];
}

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected, id }) => {
  const { state, dispatch } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const nodeSize = Math.max(80, Math.min(120, 80 + data.popularityScore * 3));
  const intensity = Math.min(100, Math.max(20, data.popularityScore * 12));

  // Find user in state to get friends count
  const currentUser = state.users.find(u => u.id === id);
  const friendsCount = currentUser?.friends?.length || 0;

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    
    event.currentTarget.style.transform = 'scale(1.15)';
    event.currentTarget.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.6)';
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    event.currentTarget.style.transform = 'scale(1.0)';
    event.currentTarget.style.boxShadow = selected 
      ? '0 8px 25px rgba(0, 123, 255, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)';
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🟡 Drop event triggered on node:', data.username);
    
    // Reset visual state
    setIsDragOver(false);
    event.currentTarget.style.transform = 'scale(1.0)';
    event.currentTarget.style.boxShadow = selected 
      ? '0 8px 25px rgba(0, 123, 255, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)';

    let hobby = event.dataTransfer.getData('application/hobby');
    if (!hobby) {
      hobby = event.dataTransfer.getData('text/plain');
    }

    if (hobby) {
      console.log(`🎯 Successfully dropped hobby "${hobby}" on user ${data.username}`);
      
      try {
        const user = state.users.find(u => u.id === id);
        if (user) {
          const currentHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
          
          if (currentHobbies.includes(hobby)) {
            toast.error(`"${data.username}" already has the hobby "${hobby}"`);
            return;
          }

          const oldScore = data.popularityScore;
          toast.loading(
            `Adding "${hobby}" to ${data.username}... (Score: ${oldScore.toFixed(1)})`, 
            { id: 'add-hobby' }
          );
          
          const updatedHobbies = [...currentHobbies, hobby];
          
          console.log('📞 Calling API to update user hobbies...');
          await apiService.updateUser(id, { hobbies: updatedHobbies });
          
          // Wait for backend processing
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Force refresh all data
          console.log('🔄 Refreshing graph data and users...');
          const [graphData, users] = await Promise.all([
            apiService.getGraphData(),
            apiService.getAllUsers()
          ]);
          
          dispatch({ type: 'SET_GRAPH_DATA', payload: graphData });
          dispatch({ type: 'SET_USERS', payload: users });
          
          // Find updated user
          const updatedUser = users.find((u: any) => u.id === id);
          const newScore = updatedUser ? 
            (typeof updatedUser.popularityScore === 'number' ? updatedUser.popularityScore : parseFloat(updatedUser.popularityScore || '0')) 
            : oldScore;
          
          console.log(`📊 Score update: ${oldScore} → ${newScore}`);
          
          // Show informative message based on score change
          if (newScore === oldScore && friendsCount === 0) {
            toast.success(
              `Added "${hobby}" to ${data.username}! 🎯\nScore still 0.0 - connect with friends to see it increase!`, 
              { 
                id: 'add-hobby',
                duration: 6000 
              }
            );
          } else {
            toast.success(
              `Added "${hobby}" to ${data.username}! 🎯\nScore: ${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`, 
              { 
                id: 'add-hobby',
                duration: 5000 
              }
            );
          }
        }
      } catch (error: any) {
        console.error('❌ Error adding hobby to user:', error);
        toast.error(error.response?.data?.error || 'Failed to add hobby to user', { id: 'add-hobby' });
      }
    } else {
      console.error('❌ No hobby data found in drop event');
      toast.error('Could not read the hobby data. Please try again.');
    }
  };

  const nodeStyle = {
    width: nodeSize,
    height: nodeSize,
    backgroundColor: isDragOver 
      ? `hsl(210, 80%, ${80 - intensity}%)` 
      : `hsl(210, 70%, ${100 - intensity}%)`,
    border: isDragOver 
      ? '3px solid #28a745' 
      : selected 
        ? '3px solid #007bff' 
        : '2px solid #ccc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'white',
    fontWeight: 'bold',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isDragOver 
      ? '0 0 25px rgba(40, 167, 69, 0.6)' 
      : selected 
        ? '0 8px 25px rgba(0, 123, 255, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: isDragOver ? 1000 : 1,
  };

  const getScoreColor = () => {
    if (data.popularityScore > 7) return '#ff4757';
    if (data.popularityScore > 4) return '#ffa502';
    return '#2ed573';
  };

  return (
    <div 
      style={nodeStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title={`${data.username} - Drag handles to connect with other users`}
    >
      {/* Top Handle - For incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#28a745',
          width: 14,
          height: 14,
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
        }}
        // REMOVED: onConnect handler - let React Flow handle this
      />
      
      <div style={{ 
        textAlign: 'center',
        padding: '8px',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '14px', lineHeight: '1.2', marginBottom: '2px' }}>
          {data.username}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.9 }}>
          Age: {data.age}
        </div>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 'bold',
          marginTop: '2px',
          color: getScoreColor(),
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          Score: {typeof data.popularityScore === 'number' ? data.popularityScore.toFixed(1) : '0.0'}
        </div>
      </div>

      {/* Bottom Handle - For outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#007bff',
          width: 14,
          height: 14,
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
        }}
        // REMOVED: onConnect handler - let React Flow handle this
      />
      
      {/* Friends indicator */}
      {friendsCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          width: '16px',
          height: '16px',
          backgroundColor: '#007bff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '8px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {friendsCount}
        </div>
      )}

      {/* Drop indicator */}
      {isDragOver && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          backgroundColor: '#28a745',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 1s infinite',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.8)'
        }}>
          ✓
        </div>
      )}

      {/* Connection tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '-45px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          🔗 Drag handles to connect users
        </div>
      )}
    </div>
  );
};

// Keep HighScoreNode and LowScoreNode the same...
export const HighScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#ff6b6b',
    border: props.selected ? '3px solid #ff4757' : '2px solid #ff6b6b',
  };

  return <CustomNode {...props} data={nodeStyle} />;
};

export const LowScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#48dbfb',
    border: props.selected ? '3px solid #0abde3' : '2px solid #48dbfb',
  };

  return <CustomNode {...props} data={nodeStyle} />;
};