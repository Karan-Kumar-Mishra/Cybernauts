import UserModelInstance from "../../config/UserModelInstance";
async function deleteUser(id: string): Promise<boolean> {
    const result = await UserModelInstance().deleteUser(id);
    if (result) {
        await UserModelInstance().invalidateGraphCache();
    }
    return result;
}
export default deleteUser;