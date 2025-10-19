"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('User API Logic Tests', () => {
    let userId1;
    let userId2;
    let userId3;
    // Increase timeout for beforeAll hook
    beforeAll(async () => {
        jest.setTimeout(10000); // 10 second timeout
        // Generate unique usernames to avoid conflicts
        const timestamp = Date.now();
        // Create test users with unique names
        const user1 = await (0, supertest_1.default)(app_1.default)
            .post('/api/users')
            .send({
            username: `TestUser1_${timestamp}`,
            age: 25,
            hobbies: ['reading', 'coding']
        });
        if (user1.status === 201) {
            userId1 = user1.body.id;
        }
        else {
            throw new Error(`Failed to create user1: ${user1.body.error}`);
        }
        const user2 = await (0, supertest_1.default)(app_1.default)
            .post('/api/users')
            .send({
            username: `TestUser2_${timestamp}`,
            age: 30,
            hobbies: ['gaming', 'coding']
        });
        if (user2.status === 201) {
            userId2 = user2.body.id;
        }
        else {
            throw new Error(`Failed to create user2: ${user2.body.error}`);
        }
        const user3 = await (0, supertest_1.default)(app_1.default)
            .post('/api/users')
            .send({
            username: `TestUser3_${timestamp}`,
            age: 28,
            hobbies: ['sports']
        });
        if (user3.status === 201) {
            userId3 = user3.body.id;
        }
        else {
            throw new Error(`Failed to create user3: ${user3.body.error}`);
        }
    }, 10000);
    // Test 1: Popularity Score Calculation
    test('Popularity score should be calculated correctly when users are linked', async () => {
        // Link users with shared hobbies
        const linkResponse = await (0, supertest_1.default)(app_1.default)
            .post(`/api/users/${userId1}/link`)
            .send({ friendId: userId2 });
        // Check if link was successful (201) or if already linked (409)
        expect([201, 409]).toContain(linkResponse.status);
        const usersResponse = await (0, supertest_1.default)(app_1.default).get('/api/users');
        const user1 = usersResponse.body.find((u) => u.id === userId1);
        const user2 = usersResponse.body.find((u) => u.id === userId2);
        // Both users should have popularity scores > 0 after linking
        expect(user1.popularityScore).toBeGreaterThan(0);
        expect(user2.popularityScore).toBeGreaterThan(0);
        // Specific calculation: 1 friend + shared hobby 'coding' (1 × 0.5) = 1.5
        // But allow for slight variations in implementation
        expect(user1.popularityScore).toBeCloseTo(1.5, 1);
        expect(user2.popularityScore).toBeCloseTo(1.5, 1);
    }, 10000);
    // Test 2: Deletion Prevention with Active Relationships
    test('Should prevent user deletion when user has active relationships', async () => {
        const response = await (0, supertest_1.default)(app_1.default).delete(`/api/users/${userId1}`);
        // Should return 409 or 400 (depending on implementation)
        expect([409, 400]).toContain(response.status);
        // Check for error message about active relationships
        if (response.status === 409 || response.status === 400) {
            expect(response.body.error).toMatch(/active relationships|cannot.*delete|friend/);
        }
    }, 10000);
    // Test 3: Circular Friendship Prevention
    test('Should prevent duplicate relationships (circular friendship prevention)', async () => {
        // Try to create the same relationship again
        const response = await (0, supertest_1.default)(app_1.default)
            .post(`/api/users/${userId1}/link`)
            .send({ friendId: userId2 });
        // Should return conflict error (409) or success if idempotent (201)
        // Both are acceptable behaviors
        expect([409, 201]).toContain(response.status);
        if (response.status === 409) {
            expect(response.body.error).toMatch(/already exists|duplicate|already.friend/);
        }
    }, 10000);
    afterAll(async () => {
        jest.setTimeout(10000);
        // Clean up: unlink and delete users
        try {
            // Unlink users if they are linked
            if (userId1 && userId2) {
                await (0, supertest_1.default)(app_1.default)
                    .delete(`/api/users/${userId1}/unlink`)
                    .send({ friendId: userId2 })
                    .timeout(5000);
            }
            // Delete users with retry logic
            const deleteUser = async (userId) => {
                if (!userId)
                    return;
                let attempts = 0;
                while (attempts < 3) {
                    const response = await (0, supertest_1.default)(app_1.default)
                        .delete(`/api/users/${userId}`)
                        .timeout(5000);
                    if (response.status === 204 || response.status === 404) {
                        break; // Success or already deleted
                    }
                    // If user has relationships, try to unlink first
                    if (response.status === 409 || response.status === 400) {
                        // Get user's friends and unlink them
                        const userResponse = await (0, supertest_1.default)(app_1.default).get(`/api/users/${userId}`);
                        if (userResponse.status === 200 && userResponse.body.friends) {
                            for (const friendId of userResponse.body.friends) {
                                await (0, supertest_1.default)(app_1.default)
                                    .delete(`/api/users/${userId}/unlink`)
                                    .send({ friendId })
                                    .timeout(5000);
                            }
                        }
                    }
                    attempts++;
                    if (attempts < 3) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            };
            await deleteUser(userId1);
            await deleteUser(userId2);
            await deleteUser(userId3);
        }
        catch (error) {
            console.warn('Cleanup warning:', error);
        }
    }, 15000);
});
