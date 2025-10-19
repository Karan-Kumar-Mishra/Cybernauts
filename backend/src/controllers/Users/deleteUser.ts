import { Request,Response } from "express";
import UserServiceInstance from "../../config/UserServiceInstance";
async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await UserServiceInstance().deleteUser(id);

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
  export default deleteUser;