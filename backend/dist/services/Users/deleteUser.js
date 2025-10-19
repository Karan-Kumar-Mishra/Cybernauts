"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModelInstance_1 = __importDefault(require("../../config/UserModelInstance"));
async function deleteUser(id) {
    const result = await (0, UserModelInstance_1.default)().deleteUser(id);
    if (result) {
        await (0, UserModelInstance_1.default)().invalidateGraphCache();
    }
    return result;
}
exports.default = deleteUser;
