import CustomNodeData from "../interfaces/CustomNodeData";
import { NodeProps } from "reactflow";
import { CustomNode } from "./CustomNode";
export const LowScoreNode: React.FC<NodeProps<CustomNodeData>> = (props) => {
  const nodeStyle = {
    ...props.data,
    backgroundColor: '#48dbfb',
    border: props.selected ? '3px solid #0abde3' : '2px solid #48dbfb',
  };

  return <CustomNode {...props} data={nodeStyle} />;
};