import { User } from "../../types";
import UserModelInstance from "../../config/UserModelInstance";
import { UpdateUserRequest } from "../../types";
import validateHobbies from "../validate/validateHobbies";
async function updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    if (updates.hobbies) {
        validateHobbies(updates.hobbies);
    }

    const updatedUser = await UserModelInstance().updateUser(id, updates);
    if (updatedUser) {
        await UserModelInstance().updatePopularityScore(id);
        const friends = await UserModelInstance().getFriends(id);
        console.log(`Updating popularity scores for ${friends.length} friends of user ${id}`);

        for (const friendId of friends) {
            await UserModelInstance().updatePopularityScore(friendId);
        }
        await UserModelInstance().invalidateGraphCache();
    }
    return updatedUser;
}
export default updateUser;