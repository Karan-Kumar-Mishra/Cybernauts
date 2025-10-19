"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const invalidateUserCache_1 = __importDefault(require("../Cache/invalidateUserCache"));
async function removeHobby(name) {
    await pool_1.default.query('DELETE FROM hobbies WHERE name = $1', [name]);
    await (0, invalidateUserCache_1.default)();
}
exports.default = removeHobby;
