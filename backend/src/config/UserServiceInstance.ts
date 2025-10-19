import { UserService } from "../services/UserService";

let userService: UserService;
userService = new UserService();
function UserServiceInstance() {
    return userService;
}
export default UserServiceInstance;