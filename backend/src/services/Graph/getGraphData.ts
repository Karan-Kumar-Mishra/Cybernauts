 import UserModelInstance from "../../config/UserModelInstance";
 async function getGraphData(): Promise<any> {
    return await UserModelInstance().getGraphData();
  }
  export default getGraphData