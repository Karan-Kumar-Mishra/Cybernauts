"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserModel_1 = require("../models/UserModel");
let userModel;
function UserModelInstance() {
    if (!userModel) {
        userModel = new UserModel_1.UserModel();
    }
    return userModel;
}
exports.default = UserModelInstance;
