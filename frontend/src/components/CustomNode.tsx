import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GraphNode } from '../types';

interface CustomNodeData {
  label: string;
  username: string;
  age: number;
  popularityScore: number;
  hobbies: string[];
}

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const nodeSize = Math.max(30, Math.min(100, 30 + data.popularityScore * 5));
  const intensity = Math.min(100, Math.max(20, data.popularityScore * 10));

  const nodeStyle = {
    width: nodeSize,
    height: nodeSize,
    backgroundColor: `hsl(210, 70%, ${100 - intensity}%)`,
    border: selected ? '2px solid #007bff' : '2px solid #ccc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'white',
    fontWeight: 'bold',
    position: 'relative' as const,
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div style={{ textAlign: 'center' }}>
        <div>{data.username}</div>
        <div style={{ fontSize: '10px' }}>{data.age}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const HighScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#ff6b6b',
    border: props.selected ? '3px solid #ff4757' : '3px solid #ff6b6b',
  };

  return <CustomNode {...props} data={nodeStyle} />;
};

export const LowScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#48dbfb',
    border: props.selected ? '3px solid #0abde3' : '3px solid #48dbfb',
  };

  return <CustomNode {...props} data={nodeStyle} />;
};