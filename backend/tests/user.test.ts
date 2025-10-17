import request from 'supertest';
import app from '../src/app';

describe('User API Tests', () => {
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Wait for app to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('GET /api/users should return all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/users should create a new user', async () => {
    const userData = {
      username: 'TestUser1',
      age: 25,
      hobbies: ['reading']
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.username).toBe(userData.username);
    userId1 = response.body.id;
  });

  test('POST /api/users should create another user', async () => {
    const userData = {
      username: 'TestUser2',
      age: 30,
      hobbies: ['gaming']
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.username).toBe(userData.username);
    userId2 = response.body.id;
  });

  test('POST /api/users/:id/link should create relationship and update popularity scores', async () => {
    const response = await request(app)
      .post(`/api/users/${userId1}/link`)
      .send({ friendId: userId2 });
    
    expect(response.status).toBe(201);

    // Check if popularity scores were updated
    const usersResponse = await request(app).get('/api/users');
    const user1 = usersResponse.body.find((u: any) => u.id === userId1);
    const user2 = usersResponse.body.find((u: any) => u.id === userId2);
    
    expect(user1.popularityScore).toBeGreaterThan(0);
    expect(user2.popularityScore).toBeGreaterThan(0);
  });

  test('DELETE /api/users/:id should prevent deletion with active relationships', async () => {
    const response = await request(app).delete(`/api/users/${userId1}`);
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('active relationships');
  });

  test('DELETE /api/users/:id/unlink should remove relationship', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId1}/unlink`)
      .send({ friendId: userId2 });
    
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    // Clean up test users
    if (userId1) {
      await request(app).delete(`/api/users/${userId1}`);
    }
    if (userId2) {
      await request(app).delete(`/api/users/${userId2}`);
    }
  });
});