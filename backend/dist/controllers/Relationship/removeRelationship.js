"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function removeRelationship(req, res) {
    try {
        const { id } = req.params;
        const { friendId } = req.body;
        if (!friendId) {
            res.status(400).json({ error: 'friendId is required' });
            return;
        }
        await (0, UserServiceInstance_1.default)().removeRelationship(id, friendId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error removing relationship:', error);
        res.status(400).json({ error: error.message });
    }
}
;
exports.default = removeRelationship;
