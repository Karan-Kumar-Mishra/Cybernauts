import { CreateUserRequest } from "../../types";
import { User } from "../../types";
import UserModelInstance from "../../config/UserModelInstance";
import validateUserData from "../validate/validateUserData";
async function createUser(userData: CreateUserRequest): Promise<User> {
    validateUserData(userData);
    
    const user = await UserModelInstance().createUser(userData);
    await UserModelInstance().updatePopularityScore(user.id);
    await UserModelInstance().invalidateGraphCache();
    return user;
}
export default createUser;