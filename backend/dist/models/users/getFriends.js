"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
async function getFriends(userId) {
    const result = await pool_1.default.query('SELECT friend_id FROM relationships WHERE user_id = $1', [userId]);
    return result.rows.map((row) => row.friend_id);
}
exports.default = getFriends;
