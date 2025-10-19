import { Request, Response } from 'express';
import pool from '../config/pool';
import UserServiceInstance from '../config/UserServiceInstance';
import getAllUsers from './Users/getAllUsers';
import createUser from './Users/createUser';
import updateUser from './Users/updateUser';
import deleteUser from './Users/deleteUser';
import createRelationship from './Relationship/createRelationship';
import removeRelationship from './Relationship/removeRelationship';
import getAllHobbies from './Hobbies/getAllHobbies';
import addHobby from './Hobbies/addHobby';
import removeHobby from './Hobbies/removeHobby';
import getGraphData from './Graph/getGraphData';
export class UserController {

  getAllUsers = getAllUsers
  createUser = createUser
  updateUser = updateUser
  deleteUser = deleteUser
  createRelationship = createRelationship
  removeRelationship = removeRelationship
  addHobby = addHobby
  removeHobby = removeHobby
  getGraphData = getGraphData
  getAllHobbies = getAllHobbies;
  
  debugDatabaseState = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get all users
      const usersResult = await pool.query('SELECT id, username FROM users');
      const users = usersResult.rows;

      // Get all relationships
      const relationshipsResult = await pool.query('SELECT user_id, friend_id FROM relationships');
      const relationships = relationshipsResult.rows;

      // Get table counts
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      const relationshipsCount = await pool.query('SELECT COUNT(*) FROM relationships');

      res.json({
        database: {
          users: {
            count: parseInt(usersCount.rows[0].count),
            list: users
          },
          relationships: {
            count: parseInt(relationshipsCount.rows[0].count),
            list: relationships
          }
        },
        graphData: await UserServiceInstance().getGraphData()
      });

    } catch (error: any) {
      console.error('Debug database state error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

}