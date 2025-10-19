import { UserService } from "../services/UserService";

let userService: UserService | undefined;

function UserServiceInstance(): UserService {
    if (!userService) {
        userService = new UserService();
    }
    return userService;
}

export default UserServiceInstance;