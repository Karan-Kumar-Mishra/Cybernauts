import { GraphNode } from "./GraphNode";
import { GraphEdge } from "./GraphEdge";
import User from "./User";
interface AppState {
  users: User[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  loading: boolean;
  error: string | null;
}
export default AppState;