import UserServiceInstance from "../../config/UserServiceInstance";
import { Request,Response } from "express";

async function getGraphData(req: Request, res: Response): Promise<void>  {
    try {
      const graphData = await UserServiceInstance().getGraphData();
      res.json(graphData);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
export default getGraphData;