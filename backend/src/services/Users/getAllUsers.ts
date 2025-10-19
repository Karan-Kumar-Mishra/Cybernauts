import { User } from "../../types";
import UserModelInstance from "../../config/UserModelInstance";
async function getAllUsers(): Promise<User[]> {
    return await UserModelInstance().getAllUsers();
}
export default getAllUsers;