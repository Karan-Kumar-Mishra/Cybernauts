
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'reactflow';

import useFlow from '../hooks/ComponentsHooks/useFlow';



function Flow() {
  const { nodeTypes, state, onConnect, onConnectEnd, onConnectStart, onDragOver, onEdgeClick,
    onNodeClick, onNodeDragStop, onPaneClick, onDrop, edgeTypes, onEdgeContextMenu, onEdgeDoubleClick,
    nodes, onNodesChange, onEdgesChange, edges } = useFlow();

  if (state.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading graph data...
      </div>
    );
  }



  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Connection Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '2px solid #007bff',
        maxWidth: '300px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#007bff' }}>
          🔗 Connection Controls:
        </div>
        <div>• Drag handles to connect users</div>
        <div>• <strong>Double-click</strong> edge to remove</div>
        <div>• <strong>Right-click</strong> edge for menu</div>
        <div>• <strong>Shift+Click</strong> edge to remove</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
          Watch browser console for events
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          type: 'custom',
        }))}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        connectionLineStyle={{ stroke: '#ff0066', strokeWidth: 3 }}
        connectionLineType="smoothstep"
        deleteKeyCode={['Delete', 'Backspace']}
        edgesFocusable={true}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Flow;