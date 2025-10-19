"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../services/UserService");
let userService;
function UserServiceInstance() {
    if (!userService) {
        userService = new UserService_1.UserService();
    }
    return userService;
}
exports.default = UserServiceInstance;
