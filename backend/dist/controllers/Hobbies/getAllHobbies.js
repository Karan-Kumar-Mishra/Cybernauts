"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function getAllHobbies(req, res) {
    try {
        const hobbies = await (0, UserServiceInstance_1.default)().getAllHobbies();
        res.json(hobbies);
    }
    catch (error) {
        console.error('Error fetching hobbies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
;
exports.default = getAllHobbies;
