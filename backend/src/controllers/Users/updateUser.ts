import UserServiceInstance from "../../config/UserServiceInstance";
import { Request, Response } from "express";
import { UpdateUserRequest } from "../../types";

async function updateUser(req: Request, res: Response): Promise<void>{
    try {
      const { id } = req.params;
      const updates: UpdateUserRequest = req.body;
      const updatedUser = await UserServiceInstance().updateUser(id, updates);

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
export default updateUser;