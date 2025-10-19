
import ReactFlow, {
  MiniMap,
  Controls,
  Background,

} from 'reactflow';

import useFlow from '../hooks/ComponentsHooks/useFlow';
import { BackgroundVariant } from 'reactflow';
import { ConnectionLineType } from 'reactflow';


function Flow() {
  const { nodeTypes, state, onConnect, onDragOver, onEdgeClick,
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
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={['Delete', 'Backspace']}
        edgesFocusable={true}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Flow;