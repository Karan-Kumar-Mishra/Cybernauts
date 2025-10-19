 import { Request,Response } from "express";
 import UserServiceInstance from "../../config/UserServiceInstance";
 async function getAllHobbies(req: Request, res: Response): Promise<void>{
    try {
      const hobbies = await UserServiceInstance().getAllHobbies();
      res.json(hobbies);
    } catch (error) {
      console.error('Error fetching hobbies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  export default getAllHobbies;