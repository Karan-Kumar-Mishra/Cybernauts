"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function addHobby(req, res) {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Hobby name is required' });
            return;
        }
        await (0, UserServiceInstance_1.default)().addHobby(name.trim());
        res.status(201).json({
            message: 'Hobby added successfully',
            hobby: name.trim()
        });
    }
    catch (error) {
        console.error('Error adding hobby:', error);
        res.status(400).json({ error: error.message });
    }
}
;
exports.default = addHobby;
