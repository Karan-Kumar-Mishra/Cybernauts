import { UserModel } from "../models/UserModel";
let userModel: UserModel;
function UserModelInstance() {
    userModel= new UserModel();
    return userModel;
}
export default UserModelInstance;