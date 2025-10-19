"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../config/pool"));
async function getAllHobbies() {
    const result = await pool_1.default.query('SELECT name FROM hobbies ORDER BY name');
    return result.rows.map((row) => row.name);
}
exports.default = getAllHobbies;
