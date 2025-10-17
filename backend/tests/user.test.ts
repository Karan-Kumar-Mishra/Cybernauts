import request from 'supertest';
import app from '../src/app';

describe('User API Tests', () => {
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await request(app)
      .post('/api/users')
      .send({ username: 'TestUser1', age: 25, hobbies: ['reading'] });
    
    const user2 = await request(app)
      .post('/api/users')
      .send({ username: 'TestUser2', age: 30, hobbies: ['gaming'] });
    
    userId1 = user1.body.id;
    userId2 = user2.body.id;
  });

  test('GET /api/users should return all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/users/:id/link should create relationship and update popularity scores', async () => {
    const response = await request(app)
      .post(`/api/users/${userId1}/link`)
      .send({ friendId: userId2 });
    
    expect(response.status).toBe(201);

    // Check if popularity scores were updated
    const user1 = await request(app).get(`/api/users`);
    const updatedUser1 = user1.body.find((u: any) => u.id === userId1);
    expect(updatedUser1.popularityScore).toBeGreaterThan(0);
  });

  test('DELETE /api/users/:id should prevent deletion with active relationships', async () => {
    const response = await request(app).delete(`/api/users/${userId1}`);
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('active relationships');
  });
});