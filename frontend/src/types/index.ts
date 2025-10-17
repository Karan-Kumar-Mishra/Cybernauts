export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: string;
  popularityScore: number;
}

export interface GraphNode {
  id: string;
  type: 'default' | 'highScore' | 'lowScore';
  data: {
    label: string;
    username: string;
    age: number;
    popularityScore: number;
    hobbies: string[];
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CreateUserRequest {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UpdateUserRequest {
  username?: string;
  age?: number;
  hobbies?: string[];
}