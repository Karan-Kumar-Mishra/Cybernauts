import { Request,Response } from "express";
import UserServiceInstance from "../../config/UserServiceInstance";
async function  addHobby(req: Request, res: Response): Promise<void>{
    try {
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        res.status(400).json({ error: 'Hobby name is required' });
        return;
      }

      await UserServiceInstance().addHobby(name.trim());
      res.status(201).json({
        message: 'Hobby added successfully',
        hobby: name.trim()
      });
    } catch (error: any) {
      console.error('Error adding hobby:', error);
      res.status(400).json({ error: error.message });
    }
  };
  export default addHobby;
