import React from 'react';
import { BaseEdge, EdgeProps, EdgeLabelRenderer, getBezierPath } from 'reactflow';


const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const deleteEvent = new CustomEvent('edgeDelete', { detail: { edgeId: id } });
    window.dispatchEvent(deleteEvent);
  };

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{
          stroke: selected ? '#ff0066' : '#555',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: selected ? '5,5' : 'none',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Delete button that appears when edge is selected */}
          {selected && (
            <button
              onClick={(event) => onEdgeClick(event, id)}
              style={{
                background: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete connection"
            >
              ×
            </button>
          )}
          
          {/* Always show a small indicator */}
          {!selected && (
            <div
              style={{
                background: 'rgba(85, 85, 85, 0.1)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: '1px solid #555',
              }}
            />
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;