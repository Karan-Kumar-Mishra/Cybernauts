interface GraphNode {
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
export default GraphNode;