"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModelInstance_1 = __importDefault(require("../../config/UserModelInstance"));
const validateUserData_1 = __importDefault(require("../validate/validateUserData"));
async function createUser(userData) {
    (0, validateUserData_1.default)(userData);
    const user = await (0, UserModelInstance_1.default)().createUser(userData);
    await (0, UserModelInstance_1.default)().updatePopularityScore(user.id);
    await (0, UserModelInstance_1.default)().invalidateGraphCache();
    return user;
}
exports.default = createUser;
