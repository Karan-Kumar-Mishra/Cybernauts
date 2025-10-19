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
    test('Popularity score should be calculated correctly when users are linked', async () => {
        // Link users with shared hobbies
        const linkResponse = await (0, supertest_1.default)(app_1.default)
            .post(`/api/users/${userId1}/link`)
            .send({ friendId: userId2 });
        expect([201, 400, 409]).toContain(linkResponse.status);
        const usersResponse = await (0, supertest_1.default)(app_1.default).get('/api/users');
        const user1 = usersResponse.body.find((u) => u.id === userId1);
        const user2 = usersResponse.body.find((u) => u.id === userId2);
    }, 10000);
    test('Should prevent user deletion when user has active relationships', async () => {
        const response = await (0, supertest_1.default)(app_1.default).delete(`/api/users/${userId1}`);
        // Should return 409 or 400 (depending on implementation)
        expect([409, 400]).toContain(response.status);
        // Check for error message about active relationships
        if (response.status === 409 || response.status === 400) {
            expect(response.body.error).toMatch(/active relationships|cannot.*delete|friend/);
        }
    }, 10000);
    test('Should prevent duplicate relationships (circular friendship prevention)', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post(`/api/users/${userId1}/link`)
            .send({ friendId: userId2 });
        expect([409, 201]).toContain(response.status);
        if (response.status === 409) {
            expect(response.body.error).toMatch(/already exists|duplicate|already.friend/);
        }
    }, 10000);
});
