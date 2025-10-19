import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import CustomNodeData from '../interfaces/CustomNodeData';
import useCustomNode from '../hooks/ComponentsHooks/useCustomNode';
export const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected, id }) => {
  const { isDragOver, friendsCount,
    handleDragLeave, handleDragOver, handleDrop, nodeStyle, getScoreColor,
    showTooltip, setShowTooltip } = useCustomNode({ data, selected, id });

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

      />

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




