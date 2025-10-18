import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types';
import pool from '../config/pool';
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: error.message });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates: UpdateUserRequest = req.body;
      const updatedUser = await this.userService.updateUser(id, updates);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(400).json({ error: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.userService.deleteUser(id);

      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.message.includes('active relationships')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  createRelationship = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { friendId } = req.body;

      if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
      }

      await this.userService.createRelationship(id, friendId);
      res.status(201).json({ message: 'Relationship created successfully' });
    } catch (error: any) {
      console.error('Error creating relationship:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists') || error.message.includes('self')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  };

  removeRelationship = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { friendId } = req.body;

      if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
      }

      await this.userService.removeRelationship(id, friendId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing relationship:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getGraphData = async (req: Request, res: Response): Promise<void> => {
    try {
      const graphData = await this.userService.getGraphData();
      res.json(graphData);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getAllHobbies = async (req: Request, res: Response): Promise<void> => {
    try {
      const hobbies = await this.userService.getAllHobbies();
      res.json(hobbies);
    } catch (error) {
      console.error('Error fetching hobbies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  addHobby = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: 'Hobby name is required' });
        return;
      }

      await this.userService.addHobby(name.trim());
      res.status(201).json({
        message: 'Hobby added successfully',
        hobby: name.trim()
      });
    } catch (error: any) {
      console.error('Error adding hobby:', error);
      res.status(400).json({ error: error.message });
    }
  };

  removeHobby = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: 'Hobby name is required' });
        return;
      }

      await this.userService.removeHobby(name);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing hobby:', error);
      res.status(400).json({ error: error.message });
    }
  };
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
        graphData: await this.userService.getGraphData()
      });

    } catch (error: any) {
      console.error('Debug database state error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

}