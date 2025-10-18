import User from "../interfaces/User";
import GraphEdge from "../interfaces/GraphEdge";
import GraphNode from "../interfaces/GraphNode";
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_GRAPH_DATA'; payload: { nodes: GraphNode[]; edges: GraphEdge[] } }
  | { type: 'SET_SELECTED_NODE'; payload: GraphNode | null }
  | { type: 'UPDATE_NODE'; payload: GraphNode }
  | { type: 'ADD_NODE'; payload: GraphNode }
  | { type: 'REMOVE_NODE'; payload: string };

export default AppAction;