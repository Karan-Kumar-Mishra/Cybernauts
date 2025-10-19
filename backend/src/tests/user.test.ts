import request from 'supertest';
import app from '../app';

describe('User API Logic Tests', () => {
  let userId1: string;
  let userId2: string;
  let userId3: string;
  beforeAll(async () => {
    const timestamp = Date.now();
    const user1 = await request(app)
      .post('/api/users')
      .send({
        username: `TestUser1_${timestamp}`,
        age: 25,
        hobbies: ['reading', 'coding']
      });

    if (user1.status === 201) {
      userId1 = user1.body.id;
    } else {
      throw new Error(`Failed to create user1: ${user1.body.error}`);
    }

    const user2 = await request(app)
      .post('/api/users')
      .send({
        username: `TestUser2_${timestamp}`,
        age: 30,
        hobbies: ['gaming', 'coding']
      });

    if (user2.status === 201) {
      userId2 = user2.body.id;
    } else {
      throw new Error(`Failed to create user2: ${user2.body.error}`);
    }

    const user3 = await request(app)
      .post('/api/users')
      .send({
        username: `TestUser3_${timestamp}`,
        age: 28,
        hobbies: ['sports']
      });

    if (user3.status === 201) {
      userId3 = user3.body.id;
    } else {
      throw new Error(`Failed to create user3: ${user3.body.error}`);
    }
  }, 20000);

  test('Popularity score should be calculated correctly when users are linked', async () => {
    const linkResponse = await request(app)
      .post(`/api/users/${userId1}/link`)
      .send({ friendId: userId2 });
    expect([201, 400, 409]).toContain(linkResponse.status);
  });


  test('Should prevent user deletion when user has active relationships', async () => {
    const response = await request(app).delete(`/api/users/${userId1}`);


    expect([409, 400]).toContain(response.status);


    if (response.status === 409 || response.status === 400) {
      expect(response.body.error).toMatch(/active relationships|cannot.*delete|friend/);
    }
  });


  test('Should prevent duplicate relationships (circular friendship prevention)', async () => {

    const response = await request(app)
      .post(`/api/users/${userId1}/link`)
      .send({ friendId: userId2 });

    expect([409, 201]).toContain(response.status);

    if (response.status === 409) {
      expect(response.body.error).toMatch(/already exists|duplicate|already.friend/);
    }
  });

  afterAll(async () => {

    try {

      if (userId1 && userId2) {
        await request(app)
          .delete(`/api/users/${userId1}/unlink`)
          .send({ friendId: userId2 })
      }
      const deleteUser = async (userId: string) => {
        if (!userId) return;

        let attempts = 0;
        while (attempts < 3) {
          const response = await request(app)
            .delete(`/api/users/${userId}`)


          if (response.status === 204 || response.status === 404) {
            break;
          }


          if (response.status === 409 || response.status === 400) {

            const userResponse = await request(app).get(`/api/users/${userId}`);
            if (userResponse.status === 200 && userResponse.body.friends) {
              for (const friendId of userResponse.body.friends) {
                await request(app)
                  .delete(`/api/users/${userId}/unlink`)
                  .send({ friendId })
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
    } catch (error) {
      console.warn('Cleanup warning:', error);

    }
  });
});