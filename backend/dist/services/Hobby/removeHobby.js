"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModelInstance_1 = __importDefault(require("../../config/UserModelInstance"));
async function removeHobby(name) {
    await (0, UserModelInstance_1.default)().removeHobby(name);
    await (0, UserModelInstance_1.default)().invalidateGraphCache();
}
exports.default = removeHobby;
