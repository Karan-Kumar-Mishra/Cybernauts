
import {
  ReactFlowProvider, // ✅ import this
} from 'reactflow';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { UserManagement } from './components/UserManagement';
import { DebugPanel } from './components/DebugPanel';
import 'reactflow/dist/style.css';
import './App.css'
import Flow from './components/Flow';
function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Toaster position="top-right" />
      <Sidebar />
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </div>
      <UserManagement />
      <DebugPanel />
    </div>
  );
}

export default App;
