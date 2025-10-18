import  {  CustomNode } from "../components/CustomNode";
import { HighScoreNode } from "../components/CustomNode";
import { LowScoreNode } from "../components/CustomNode";
 type nodeTypes = {
    default: typeof CustomNode,
    highScore: typeof HighScoreNode,
    lowScore: typeof LowScoreNode,
};
export default nodeTypes