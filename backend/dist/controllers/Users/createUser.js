"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserServiceInstance_1 = __importDefault(require("../../config/UserServiceInstance"));
async function createUser(req, res) {
    try {
        const userData = req.body;
        const user = await (0, UserServiceInstance_1.default)().createUser(userData);
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
}
;
exports.default = createUser;
