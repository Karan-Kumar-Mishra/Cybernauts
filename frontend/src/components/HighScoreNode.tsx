import { NodeProps } from "reactflow";
import CustomNodeData from "../interfaces/CustomNodeData";
import { CustomNode } from "./CustomNode";
export const HighScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#ff6b6b',
    border: props.selected ? '3px solid #ff4757' : '2px solid #ff6b6b',
  };
  return <CustomNode {...props} data={nodeStyle} />;
};
