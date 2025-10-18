import getUserById from "../users/getUserById";
import getFriends from "../users/getFriends";

async function calculatePopularityScore(userId: string): Promise<number> {
    const user = await getUserById(userId);
    if (!user) return 0;

    const friends = await getFriends(userId);
    const uniqueFriends = new Set(friends).size;
    let totalSharedHobbies = 0;

    console.log(`Calculating popularity for ${user.username}: ${uniqueFriends} friends`);

    for (const friendId of friends) {
        const friend = await getUserById(friendId);
        if (friend) {
            const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
            const friendHobbies = Array.isArray(friend.hobbies) ? friend.hobbies : [];

            const sharedHobbies = userHobbies.filter(hobby =>
                friendHobbies.includes(hobby)
            );
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
export default calculatePopularityScore;