"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../services/UserService");
let userService;
userService = new UserService_1.UserService();
function UserServiceInstance() {
    return userService;
}
exports.default = UserServiceInstance;
