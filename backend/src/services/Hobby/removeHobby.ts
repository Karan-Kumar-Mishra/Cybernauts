 import UserModelInstance from "../../config/UserModelInstance";
 async function removeHobby(name: string): Promise<void> {
    await UserModelInstance().removeHobby(name);
    await UserModelInstance().invalidateGraphCache();
  }
export default removeHobby;