"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserById_1 = __importDefault(require("../users/getUserById"));
const getFriends_1 = __importDefault(require("../users/getFriends"));
async function calculatePopularityScore(userId) {
    const user = await (0, getUserById_1.default)(userId);
    if (!user)
        return 0;
    const friends = await (0, getFriends_1.default)(userId);
    const uniqueFriends = new Set(friends).size;
    let totalSharedHobbies = 0;
    console.log(`Calculating popularity for ${user.username}: ${uniqueFriends} friends`);
    for (const friendId of friends) {
        const friend = await (0, getUserById_1.default)(friendId);
        if (friend) {
            const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
            const friendHobbies = Array.isArray(friend.hobbies) ? friend.hobbies : [];
            const sharedHobbies = userHobbies.filter(hobby => friendHobbies.includes(hobby));
            totalSharedHobbies += sharedHobbies.length;
            if (sharedHobbies.length > 0) {
                console.log(`  Shared ${sharedHobbies.length} hobbies with ${friend.username}: ${sharedHobbies.join(', ')}`);
            }
        }
    }
    const score = uniqueFriends + (totalSharedHobbies * 0.5);
    console.log(`Final popularity score for ${user.username}: ${score} (friends: ${uniqueFriends}, shared hobbies: ${totalSharedHobbies})`);
    return score;
}
exports.default = calculatePopularityScore;
