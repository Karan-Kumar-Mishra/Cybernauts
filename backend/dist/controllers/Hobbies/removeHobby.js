"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function removeHobby(req, res) {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Hobby name is required' });
            return;
        }
        await (0, UserServiceInstance_1.default)().removeHobby(name);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error removing hobby:', error);
        res.status(400).json({ error: error.message });
    }
}
;
exports.default = removeHobby;
