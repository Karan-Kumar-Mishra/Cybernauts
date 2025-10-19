"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModelInstance_1 = __importDefault(require("../../config/UserModelInstance"));
const validateHobbies_1 = __importDefault(require("../validate/validateHobbies"));
async function updateUser(id, updates) {
    if (updates.hobbies) {
        (0, validateHobbies_1.default)(updates.hobbies);
    }
    const updatedUser = await (0, UserModelInstance_1.default)().updateUser(id, updates);
    if (updatedUser) {
        await (0, UserModelInstance_1.default)().updatePopularityScore(id);
        const friends = await (0, UserModelInstance_1.default)().getFriends(id);
        console.log(`Updating popularity scores for ${friends.length} friends of user ${id}`);
        for (const friendId of friends) {
            await (0, UserModelInstance_1.default)().updatePopularityScore(friendId);
        }
        await (0, UserModelInstance_1.default)().invalidateGraphCache();
    }
    return updatedUser;
}
exports.default = updateUser;
