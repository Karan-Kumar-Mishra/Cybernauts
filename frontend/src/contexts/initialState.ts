import AppState from "../interfaces/AppState";

const initialState: AppState = {
  users: [],
  nodes: [],
  edges: [],
  selectedNode: null,
  loading: false,
  error: null,
};
export default initialState