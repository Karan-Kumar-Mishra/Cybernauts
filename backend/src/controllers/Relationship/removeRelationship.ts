import { Request, Response } from "express";
import UserServiceInstance from "../../config/UserServiceInstance";
async function removeRelationship(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { friendId } = req.body;

        if (!friendId) {
            res.status(400).json({ error: 'friendId is required' });
            return;
        }

        await UserServiceInstance().removeRelationship(id, friendId);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error removing relationship:', error);
        res.status(400).json({ error: error.message });
    }
};
export default removeRelationship;