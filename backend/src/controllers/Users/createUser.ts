import UserServiceInstance from "../../config/UserServiceInstance";
import { Request, Response } from "express";
import { CreateUserRequest } from "../../types";

async function createUser(req: Request, res: Response): Promise<void>{
   try {
        const userData: CreateUserRequest = req.body;
        const user = await UserServiceInstance().createUser(userData);
        res.status(201).json(user);
      } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
      }
};
export default createUser;