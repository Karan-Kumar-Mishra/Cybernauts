"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../config/pool"));
async function testDatabaseConnection() {
    try {
        console.log(' Testing database connection...');
        const connectionTest = await pool_1.default.query('SELECT NOW() as current_time');
        console.log('✅ Database connection test passed:', connectionTest.rows[0].current_time);
        const usersTest = await pool_1.default.query('SELECT COUNT(*) as user_count FROM users');
        console.log(`✅ Users table test passed: ${usersTest.rows[0].user_count} users`);
        const relationshipsTest = await pool_1.default.query('SELECT COUNT(*) as relationship_count FROM relationships');
        console.log(` Relationships table test passed: ${relationshipsTest.rows[0].relationship_count} relationships`);
    }
    catch (error) {
        console.error(' Database connection test failed:', error);
        throw error;
    }
}
exports.default = testDatabaseConnection;
