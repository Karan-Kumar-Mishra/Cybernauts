"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateHobbies_1 = __importDefault(require("./validateHobbies"));
function validateUserData(userData) {
    if (!userData.username || userData.username.trim().length === 0) {
        throw new Error('Username is required');
    }
    if (userData.age < 0 || userData.age > 150) {
        throw new Error('Age must be between 0 and 150');
    }
    if (!Array.isArray(userData.hobbies)) {
        throw new Error('Hobbies must be an array');
    }
    (0, validateHobbies_1.default)(userData.hobbies);
}
exports.default = validateUserData;
