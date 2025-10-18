import AppAction from "../types/AppAction";
import AppState from "../interfaces/AppState";
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_GRAPH_DATA':
      return { ...state, nodes: action.payload.nodes, edges: action.payload.edges };
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id ? action.payload : node
        ),
      };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'REMOVE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        edges: state.edges.filter(
          edge => edge.source !== action.payload && edge.target !== action.payload
        ),
      };
    default:
      return state;
  }
};
export default appReducer;