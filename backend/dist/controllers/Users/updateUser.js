"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedUser = await (0, UserServiceInstance_1.default)().updateUser(id, updates);
        if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ error: error.message });
    }
}
;
exports.default = updateUser;
