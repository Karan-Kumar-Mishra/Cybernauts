import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, GraphNode, GraphEdge } from '../types';

interface AppState {
  users: User[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_GRAPH_DATA'; payload: { nodes: GraphNode[]; edges: GraphEdge[] } }
  | { type: 'SET_SELECTED_NODE'; payload: GraphNode | null }
  | { type: 'UPDATE_NODE'; payload: GraphNode }
  | { type: 'ADD_NODE'; payload: GraphNode }
  | { type: 'REMOVE_NODE'; payload: string };

const initialState: AppState = {
  users: [],
  nodes: [],
  edges: [],
  selectedNode: null,
  loading: false,
  error: null,
};

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

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};