"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function createRelationship(req, res) {
    try {
        const { id } = req.params;
        const { friendId } = req.body;
        if (!friendId) {
            res.status(400).json({ error: 'friendId is required' });
            return;
        }
        await (0, UserServiceInstance_1.default)().createRelationship(id, friendId);
        res.status(201).json({ message: 'Relationship created successfully' });
    }
    catch (error) {
        console.error('Error creating relationship:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        }
        else if (error.message.includes('already exists') || error.message.includes('self')) {
            res.status(409).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: error.message });
        }
    }
}
;
exports.default = createRelationship;
