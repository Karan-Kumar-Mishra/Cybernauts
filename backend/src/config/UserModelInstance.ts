import { UserModel } from "../models/UserModel";

let userModel: UserModel | undefined;

function UserModelInstance(): UserModel {
    if (!userModel) {
        userModel = new UserModel();
    }
    return userModel;
}

export default UserModelInstance;