import UserServiceInstance from "../../config/UserServiceInstance";
import { Request, Response } from "express";
async function getAllUsers(req: Request, res: Response): Promise<void>{
    try {
        const users = await UserServiceInstance().getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default getAllUsers;