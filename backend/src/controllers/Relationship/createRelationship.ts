import { Request,Response } from "express";
import UserServiceInstance from "../../config/UserServiceInstance";
async function  createRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { friendId } = req.body;

      if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
      }

      await UserServiceInstance().createRelationship(id, friendId);
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
  export default createRelationship;