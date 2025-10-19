"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const success = await (0, UserServiceInstance_1.default)().deleteUser(id);
        if (!success) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting user:', error);
        if (error.message.includes('active relationships')) {
            res.status(409).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
;
exports.default = deleteUser;
