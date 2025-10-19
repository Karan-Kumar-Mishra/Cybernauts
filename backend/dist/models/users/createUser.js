"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
const invalidateUserCache_1 = __importDefault(require("../Cache/invalidateUserCache"));
async function createUser(userData) {
    const { username, age, hobbies } = userData;
    const result = await pool_1.default.query(`
      INSERT INTO users (username, age, hobbies, popularity_score)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        username,
        age,
        hobbies,
        created_at as "createdAt",
        popularity_score as "popularityScore"
    `, [username, age, hobbies || [], 0]);
    const newUser = {
        ...result.rows[0],
        friends: []
    };
    // Invalidate cache
    await (0, invalidateUserCache_1.default)();
    return newUser;
}
exports.default = createUser;
