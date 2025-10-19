import UserModelInstance from "../../config/UserModelInstance";

async function createRelationship(userId: string, friendId: string): Promise<void> {
    await UserModelInstance().createRelationship(userId, friendId);
    await UserModelInstance().updatePopularityScore(userId);
    await UserModelInstance().updatePopularityScore(friendId);
    const [userFriends, friendFriends] = await Promise.all([
        UserModelInstance().getFriends(userId),
        UserModelInstance().getFriends(friendId)
    ]);
    const allAffectedUsers = new Set([...userFriends, ...friendFriends]);
    console.log(`Updating popularity scores for ${allAffectedUsers.size} affected users`);
    for (const affectedUserId of allAffectedUsers) {
        await UserModelInstance().updatePopularityScore(affectedUserId);
    }
    await UserModelInstance().invalidateGraphCache();
}
export default createRelationship;