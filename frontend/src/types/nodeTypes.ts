import  {  CustomNode } from "../components/CustomNode";
import { HighScoreNode } from "../components/HighScoreNode";
import { LowScoreNode } from "../components/LowScoreNode";
 type nodeTypes = {
    default: typeof CustomNode,
    highScore: typeof HighScoreNode,
    lowScore: typeof LowScoreNode,
};
export default nodeTypes