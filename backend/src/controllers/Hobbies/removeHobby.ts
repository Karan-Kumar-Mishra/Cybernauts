import { Request, Response } from "express";
import UserServiceInstance from "../../config/UserServiceInstance";
async function removeHobby(req: Request, res: Response): Promise<void> {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'Hobby name is required' });
            return;
        }

        await UserServiceInstance().removeHobby(name);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error removing hobby:', error);
        res.status(400).json({ error: error.message });
    }
};
export default removeHobby;