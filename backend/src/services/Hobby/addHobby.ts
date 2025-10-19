 import UserModelInstance from "../../config/UserModelInstance";
 async function addHobby(name: string): Promise<void> {
    await UserModelInstance().addHobby(name);
    await UserModelInstance().invalidateGraphCache();
  }
  export default addHobby;