"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModelInstance_1 = __importDefault(require("../../config/UserModelInstance"));
async function removeRelationship(userId, friendId) {
    await (0, UserModelInstance_1.default)().removeRelationship(userId, friendId);
    await (0, UserModelInstance_1.default)().updatePopularityScore(userId);
    await (0, UserModelInstance_1.default)().updatePopularityScore(friendId);
    const [userFriends, friendFriends] = await Promise.all([
        (0, UserModelInstance_1.default)().getFriends(userId),
        (0, UserModelInstance_1.default)().getFriends(friendId)
    ]);
    const allAffectedUsers = new Set([...userFriends, ...friendFriends]);
    console.log(`Updating popularity scores for ${allAffectedUsers.size} affected users`);
    for (const affectedUserId of allAffectedUsers) {
        await (0, UserModelInstance_1.default)().updatePopularityScore(affectedUserId);
    }
    await (0, UserModelInstance_1.default)()?.invalidateGraphCache();
}
exports.default = removeRelationship;
