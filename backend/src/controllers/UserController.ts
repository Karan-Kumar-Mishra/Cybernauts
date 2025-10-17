import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = (req: Request, res: Response): void => {
    try {
      const users = this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createUser = (req: Request, res: Response): void => {
    try {
      const userData: CreateUserRequest = req.body;
      const user = this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateUser = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const updates: UpdateUserRequest = req.body;
      const updatedUser = this.userService.updateUser(id, updates);
      
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteUser = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const success = this.userService.deleteUser(id);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('active relationships')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  createRelationship = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { friendId } = req.body;
      
      if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
      }
      
      this.userService.createRelationship(id, friendId);
      res.status(201).json({ message: 'Relationship created successfully' });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists') || error.message.includes('self')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  };

  removeRelationship = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { friendId } = req.body;
      
      if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
      }
      
      this.userService.removeRelationship(id, friendId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getGraphData = (req: Request, res: Response): void => {
    try {
      const graphData = this.userService.getGraphData();
      res.json(graphData);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}