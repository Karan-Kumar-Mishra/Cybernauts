import UserModelInstance from "../../config/UserModelInstance";
async function getAllHobbies(): Promise<string[]> {
    return await UserModelInstance().getAllHobbies();
}
export default getAllHobbies;